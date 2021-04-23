import requests
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource, marshal
from werkzeug.exceptions import BadRequest, NotFound, NotImplemented

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_any_of, VIEW_ALL, GIS

from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.transmogrify_now import transmogrify_now
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL, IMPORTED_NOW_SUBMISSION_DOCUMENT, APPLICATION_REASON_CODE_XREF
from app.api.services.nros_now_status_service import NROSNOWStatusService
from app.api.services.document_manager_service import DocumentManagerService
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type import MineTypeDetail


class NOWApplicationResource(Resource, UserMixin):
    @api.doc(
        description='Get a Notice of Work application.',
        params={
            'original': 'Retrieve the original version of the application. Default: false',
        })
    @requires_any_of([VIEW_ALL, GIS])
    @api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def get(self, application_guid):
        original = request.args.get('original', False, type=bool)

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id and not original:
            application = now_application_identity.now_application
            application.imported_to_core = True
        else:
            application = transmogrify_now(now_application_identity, include_contacts=original)
            application.imported_to_core = False

        application.filtered_submission_documents = NOWApplication.get_filtered_submissions_document(
            now_application=application)

        return application

    @api.doc(
        description=
        'Updates a now application and nested objects, this endpoint is not idempotent, nested objects without primary keys will be treated as new objects.'
    )
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def put(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id is None:
            raise NotImplemented(
                'This application has not been imported. Please import an application before making changes.'
            )
        data = request.json
        lead_inspector_party_guid = data.get('lead_inspector_party_guid', None)
        if lead_inspector_party_guid:
            now_application_identity.now_application.lead_inspector_party_guid = lead_inspector_party_guid
        issuing_inspector_party_guid = data.get('issuing_inspector_party_guid', None)
        if issuing_inspector_party_guid:
            now_application_identity.now_application.issuing_inspector_party_guid = issuing_inspector_party_guid

        now_application_status_code = data.get('now_application_status_code', None)
        if now_application_status_code is not None and now_application_identity.now_application.now_application_status_code != now_application_status_code:
            raise AssertionError("now_application_status_code must not be modified")

        if data.get('mine_guid', None):
            mine = Mine.find_by_mine_guid(data['mine_guid'])
            if not mine:
                raise BadRequest('mine not found')
            current_app.logger.info(f'Assigning {now_application_identity} to {mine}')
            now_application_identity.mine = mine
        now_application_identity.save()

        # If not already requested, create the job to import this NoW's submission documents.
        if not now_application_identity.is_document_import_requested:
            now_application = now_application_identity.now_application
            resp = DocumentManagerService.importNoticeOfWorkSubmissionDocuments(
                request, now_application)
            now_application_identity.is_document_import_requested = resp.status_code == requests.codes.created
            now_application_identity.save()

        filtered_submission_documents = data.get('filtered_submission_documents', None)

        # Remove these so deep_update_from_dict doesn't try to process them.
        if 'filtered_submission_documents' in data:
            del data['filtered_submission_documents']
        if 'imported_submission_documents' in data:
            del data['imported_submission_documents']
        if 'submission_documents' in data:
            del data['submission_documents']

        if filtered_submission_documents:
            imported_documents = now_application_identity.now_application.imported_submission_documents
            for doc in imported_documents:
                filtered_doc = next(
                    (x for x in filtered_submission_documents
                     if x['documenturl'] == doc.documenturl and x['messageid'] == doc.messageid
                     and x['filename'] == doc.filename and x['documenttype'] == doc.documenttype),
                    None)
                if filtered_doc:
                    doc.is_final_package = filtered_doc['is_final_package']
                    doc.is_consultation_package = filtered_doc['is_consultation_package']
                    doc.is_referral_package = filtered_doc['is_referral_package']

            data['imported_submission_documents'] = marshal(imported_documents,
                                                            IMPORTED_NOW_SUBMISSION_DOCUMENT)

        def map_application_reason_codes(data):
            reason_codes = data.get('application_reason_codes')
            del data['application_reason_codes']

            existing_reasons = [
                code.application_reason_code
                for code in now_application_identity.now_application.application_reason_codes
            ]
            reason_code_entities = []
            for code in reason_codes:
                reason_code_entities.append({
                    'application_reason_code':
                    code,
                    'now_application_id':
                    now_application_identity.now_application_id
                })
            for code in existing_reasons:
                if code not in reason_codes:
                    reason_code_entities.append({
                        'application_reason_code': code,
                        'now_application_id': now_application_identity.now_application_id,
                        'state_modified': 'delete'
                    })

            return marshal(reason_code_entities, APPLICATION_REASON_CODE_XREF)

        if now_application_identity.application_type_code == 'ADA' and 'application_reason_codes' in data:
            data['application_reason_codes'] = map_application_reason_codes(data)
        # enable this when the site_properties flow for NOW and ADA is ready
        # if now_application_identity.application_type_code == 'ADA' and 'site_property' in data and data.get(
        #         'site_property'):
        #     if not now_application_identity.now_application.site_property:
        #         mine_type = MineType.create(
        #             now_application_identity.mine_guid,
        #             data['site_property']['mine_tenure_type_code'],
        #             now_application_identity.now_application.source_permit_guid
        #             if now_application_identity.application_type_code == 'ADA' else
        #             now_application_identity.now_application.related_permit_guid)

        #         for d_code in data['site_property']['mine_disturbance_code']:
        #             MineTypeDetail.create(mine_type, mine_disturbance_code=d_code)

        #         for c_code in data['site_property']['mine_commodity_code']:
        #             MineTypeDetail.create(mine_type, mine_commodity_code=c_code)

        #     else:
        #         MineType.update_mine_type_details(
        #             mine_guid=data['mine_guid'],
        #             mine_disturbance_codes=data['site_property']['mine_disturbance_code'],
        #             mine_commodity_codes=data['site_property']['mine_commodity_code'])

        now_application_identity.now_application.deep_update_from_dict(data)
        NROSNOWStatusService.nros_now_status_update(
            now_application_identity.now_number,
            now_application_identity.now_application.status.description,
            now_application_identity.now_application.status_updated_date.strftime(
                "%Y-%m-%dT%H:%M:%S"))

        return now_application_identity.now_application
