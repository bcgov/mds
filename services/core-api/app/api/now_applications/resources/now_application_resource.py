import uuid
import requests
from datetime import datetime
import json

from flask import request, current_app
from flask_restplus import Resource, marshal
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, NotImplemented

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit

from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.transmogrify_now import transmogrify_now
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL, IMPORTED_NOW_SUBMISSION_DOCUMENT
from app.api.services.nros_now_status_service import NROSNOWStatusService
from app.api.services.document_manager_service import DocumentManagerService


class NOWApplicationResource(Resource, UserMixin):
    @api.doc(
        description='Get a notice of work application.',
        params={
            'original': f'Retrieve the original version of the application. Default: false ',
        })
    @requires_role_view_all
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
        if lead_inspector_party_guid is not None:
            now_application_identity.now_application.lead_inspector_party_guid = lead_inspector_party_guid

        now_application_status_code = data.get('now_application_status_code', None)
        if now_application_status_code is not None and now_application_identity.now_application.now_application_status_code != now_application_status_code:
            now_application_identity.now_application.status_updated_date = datetime.today()

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

        # prepare imported submissions documents
        if 'imported_submission_documents' in data:
            del data['imported_submission_documents']

        filtered_submission_documents = data.get('filtered_submission_documents', None)
        if 'filtered_submission_documents' in data:
            del data['filtered_submission_documents']

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

            data['imported_submission_documents'] = marshal(imported_documents,
                                                            IMPORTED_NOW_SUBMISSION_DOCUMENT)

        now_application_identity.now_application.deep_update_from_dict(data)
        NROSNOWStatusService.nros_now_status_update(
            now_application_identity.now_number,
            now_application_identity.now_application.status.description,
            now_application_identity.now_application.status_updated_date.strftime(
                "%Y-%m-%dT%H:%M:%S"))

        return now_application_identity.now_application

    @requires_role_edit_permit
    def post(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        now_application = now_application_identity.now_application
        if now_application:
            resp = DocumentManagerService.importNoticeOfWorkSubmissionDocuments(
                request, now_application)
            return resp
