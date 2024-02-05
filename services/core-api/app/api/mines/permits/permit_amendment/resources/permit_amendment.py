import json

from datetime import datetime
from flask_restx import Resource, reqparse, inputs
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api, jwt, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_AMENDMENT_MODEL
from app.api.utils.access_decorators import MINE_ADMIN, EDIT_HISTORICAL_PERMIT_AMENDMENTS
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.application_type_code import ApplicationTypeCode
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.mines.mine.resources.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.utils.helpers import get_preamble_text

ROLES_ALLOWED_TO_CREATE_HISTORICAL_AMENDMENTS = [MINE_ADMIN, EDIT_HISTORICAL_PERMIT_AMENDMENTS]


def validate_issue_date(issue_date, permit_amendment_type_code, permit_guid, mine_guid):
    if permit_amendment_type_code == 'OGP':
        return

    original_permit_amendment = PermitAmendment.find_original_permit_amendment_by_permit_guid(
        permit_guid, mine_guid)

    if not jwt.validate_roles(
            ROLES_ALLOWED_TO_CREATE_HISTORICAL_AMENDMENTS
    ) and original_permit_amendment and original_permit_amendment.issue_date:
        if issue_date and original_permit_amendment.issue_date > issue_date.date():
            raise AssertionError(
                'Permit amendment issue date cannot be before the permits First Issued date.')


class PermitAmendmentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'received_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'issue_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=inputs.datetime_from_iso8601,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('liability_adjustment', type=str, location='json', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'now_application_guid',
        type=str,
        location='json',
        help='The now_application_guid this permit is related to.')
    parser.add_argument(
        'issuing_inspector_title',
        type=str,
        location='json',
        help='Title of the Issuing Inspector for this permit.')
    parser.add_argument(
        'regional_office', type=str, location='json', help='The regional office for this permit.')
    parser.add_argument(
        'is_historical_amendment', type=bool, location='json', help='Is it a historical amendment')
    parser.add_argument(
        'populate_with_conditions',
        type=bool,
        location='json',
        help='Determines if the Permit should be generated through Core with conditions.')

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=201)
    def post(self, mine_guid, permit_guid, permit_amendment_guid=None):
        if permit_amendment_guid:
            raise BadRequest('Unexpected permit_amendement_guid.')

        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            raise NotFound('Permit does not exist.')

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine does not exist")
        # if str(pid) not in [m.mine_guid for m in permit.all_mines]:
        #     raise BadRequest('Permits mine_guid and provided mine_guid mismatch.')
        data = self.parser.parse_args()
        current_app.logger.info(f'creating permit_amendment with >> {data}')

        validate_issue_date(
            data.get('issue_date'), data.get('permit_amendment_type_code'), permit.permit_guid,
            mine_guid)

        permittee_party_guid = None
        if not data.get('is_historical_amendment', False):
            permittee_party_guid = data.get('permittee_party_guid', None)

        permittee_end_date = None
        if permittee_party_guid:
            party = Party.find_by_party_guid(data.get('permittee_party_guid'))
            if not party:
                raise NotFound('Permittee party not found')

            is_historical_permit = False
            permit_issue_datetime = data.get('issue_date')
            # convert permit_issue_date to a date object to compare with permittee start_date,
            #Both dates are stored in the DB as Dates, and are being converted to SQLAlchemy dateTimes in the modals, but for some reason being returned as Python Dates.
            if permit_issue_datetime:
                permit_issue_date = datetime.date(permit_issue_datetime)

            permittees = permit.permittee_appointments
            if permittees:
                new_end_dates = MinePartyAppointment.find_appointment_end_dates(
                    permit.permit_id, permit_issue_date)

                for permittee in permittees:
                    # check if the new appointment is older than the current appointment, if so create a new permittee appointment
                    if permittee.start_date > permit_issue_date:
                        is_historical_permit = True
                    else:
                        # if the amendment is the newest, change the end dates of the other appointments
                        position = new_end_dates.index(permittee.start_date)
                        if new_end_dates.index(permittee.start_date) == 0:
                            permittee.save()
                        else:
                            permittee.end_date = new_end_dates[position - 1]
                            permittee.save()
                position = new_end_dates.index(permit_issue_date)
                permittee_end_date = new_end_dates[position - 1] if is_historical_permit else None

            # create a new appointment, so every amendment is associated with a permittee
            new_permittee = MinePartyAppointment.create(
                None,
                data.get('permittee_party_guid'),
                mine_party_appt_type_code='PMT',
                processed_by=self.get_user_info(),
                start_date=permit_issue_date,
                end_date=permittee_end_date,
                permit=permit)
            new_permittee.assign_related_guid('PMT', permit.permit_guid)
            new_permittee.save()

        permit_amendment_type_code = data.get('permit_amendment_type_code')
        permit_amendment_status_code = data.get('permit_amendment_status_code')

        now_application_guid = data.get('now_application_guid')
        populate_with_conditions = data.get('populate_with_conditions', True)
        is_generated_in_core = True if permit_amendment_status_code == "DFT" and populate_with_conditions else False

        new_pa = PermitAmendment.create(
            permit,
            mine,
            received_date=data.get('received_date'),
            issue_date=data.get('issue_date'),
            authorization_end_date=data.get('authorization_end_date'),
            permit_amendment_type_code=permit_amendment_type_code
            if permit_amendment_type_code else 'AMD',
            description=data.get('description'),
            liability_adjustment=data.get('liability_adjustment'),
            permit_amendment_status_code=permit_amendment_status_code
            if permit_amendment_status_code else 'ACT',
            issuing_inspector_title=data.get('issuing_inspector_title'),
            regional_office=data.get('regional_office'),
            now_application_guid=data.get('now_application_guid'),
            is_generated_in_core=is_generated_in_core)

        uploadedFiles = data.get('uploadedFiles', [])
        for newFile in uploadedFiles:
            new_pa_doc = PermitAmendmentDocument(
                document_name=newFile['fileName'],
                document_manager_guid=newFile['document_manager_guid'],
                mine_guid=mine.mine_guid,
            )
            new_pa.related_documents.append(new_pa_doc)

        if now_application_guid is not None and permit_amendment_status_code == "DFT":
            application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)

            application_type_description = None
            if application_identity:
                application_type = ApplicationTypeCode.find_by_application_type_code(
                    application_identity.application_type_code)
                application_type_description = 'application' if application_type.application_type_code == 'ADA' else application_type.description
                new_pa.preamble_text = get_preamble_text(
                    application_type_description) if is_generated_in_core else None

            def create_standard_conditions(application_identity):
                now_type = application_identity.now_application.notice_of_work_type_code
                standard_conditions = StandardPermitConditions.find_by_notice_of_work_type_code(
                    now_type)
                for condition in standard_conditions:
                    PermitConditions.create(condition.condition_category_code,
                                            condition.condition_type_code,
                                            new_pa.permit_amendment_id, condition.condition,
                                            condition.display_order, condition.sub_conditions)

            if application_identity.now_application:
                if populate_with_conditions:
                    permit_amendment_id = None
                    if application_identity.application_type_code == 'NOW':
                        permit_amendment = PermitAmendment.find_last_amendment_by_permit_id(
                            permit.permit_id)
                        permit_amendment_id = permit_amendment.permit_amendment_id
                    else:
                        permit_amendment_id = application_identity.source_permit_amendment_id

                    conditions = PermitConditions.find_all_by_permit_amendment_id(
                        permit_amendment_id)
                    if conditions:
                        for condition in conditions:
                            PermitConditions.create(condition.condition_category_code,
                                                    condition.condition_type_code,
                                                    new_pa.permit_amendment_id, condition.condition,
                                                    condition.display_order,
                                                    condition.sub_conditions)
                    else:
                        create_standard_conditions(application_identity)

                    db.session.commit()

                # create site properties if DFT permit_amendment
                if not application_identity.now_application.site_property:
                    site_property = MineType.find_by_permit_guid(permit_guid, mine_guid)

                    if site_property:
                        MineType.create_or_update_mine_type_with_details(
                            mine_guid=mine_guid,
                            now_application_guid=now_application_guid,
                            mine_tenure_type_code=site_property.mine_tenure_type_code,
                            mine_disturbance_codes=[
                                detail.mine_disturbance_code
                                for detail in site_property.mine_type_detail
                                if detail.mine_disturbance_code
                            ],
                            mine_commodity_codes=[
                                detail.mine_commodity_code
                                for detail in site_property.mine_type_detail
                                if detail.mine_commodity_code
                            ])

        new_pa.save()
        return new_pa


class PermitAmendmentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'issue_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('liability_adjustment', type=str, location='json', store_missing=False)
    parser.add_argument(
        'security_received_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument('security_not_required', location='json', type=bool, store_missing=False)
    parser.add_argument(
        'security_not_required_reason', location='json', type=str, store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'issuing_inspector_title',
        type=str,
        location='json',
        store_missing=False,
        help='Title of the Issuing Inspector for this permit.')
    parser.add_argument(
        'regional_office',
        type=str,
        location='json',
        store_missing=False,
        help='The regional office for this permit.')
    parser.add_argument(
        'final_original_documents_metadata',
        type=json.loads,
        location='json',
        store_missing=False,
        help='The file metadata for each original file in the final application package.')
    parser.add_argument(
        'final_requested_documents_metadata',
        type=json.loads,
        location='json',
        store_missing=False,
        help='The file metadata for each requested file in the final application package.')
    parser.add_argument(
        'previous_amendment_documents_metadata',
        type=json.loads,
        location='json',
        store_missing=False,
        help='The file metadata for each file from the previous permit amendment.')
    parser.add_argument(
        'site_properties',
        type=json.dumps,
        location='json',
        store_missing=False,
        help='{ mine_commodity_code, mine_disturbance_code}.')
    parser.add_argument(
        'preamble_text',
        type=str,
        location='json',
        store_missing=False,
        help='Preamble text.')

    @api.doc(params={'permit_amendment_guid': 'Permit amendment guid.'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=200)
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')
        return permit_amendment

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=200)
    def put(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        data = self.parser.parse_args()
        data['site_properties'] = json.loads(data.get('site_properties', '{}'))
        current_app.logger.info(f'updating {permit_amendment} with >> {data}')

        validate_issue_date(
            data.get('issue_date'), data.get('permit_amendment_type_code'),
            permit_amendment.permit_guid, mine_guid)

        if data.get(
                'site_properties') != {} and permit_amendment.permit_amendment_status_code == 'DFT':

            MineType.create_or_update_mine_type_with_details(
                mine_guid=mine_guid,
                now_application_guid=permit_amendment.now_application_guid,
                mine_tenure_type_code=data.get('site_properties', {}).get('mine_tenure_type_code'),
                mine_disturbance_codes=data.get('site_properties',
                                                {}).get('mine_disturbance_code', []),
                mine_commodity_codes=data.get('site_properties', {}).get('mine_commodity_code', []))

        for key, value in data.items():
            if key == 'uploadedFiles':
                for newFile in value:
                    new_pa_doc = PermitAmendmentDocument(
                        document_name=newFile['fileName'],
                        document_manager_guid=newFile['document_manager_guid'],
                        mine_guid=permit_amendment.mine_guid,
                    )
                    permit_amendment.related_documents.append(new_pa_doc)
            elif key == 'site_properties':
                continue
            else:
                setattr(permit_amendment, key, value)

        # Update file metadata for the original final application package files.
        final_original_documents_metadata = data.get('final_original_documents_metadata', {})
        if final_original_documents_metadata:
            for now_application_document_xref_guid, values in final_original_documents_metadata.items(
            ):
                doc = NOWApplicationDocumentIdentityXref.find_by_guid(
                    now_application_document_xref_guid)
                if doc is None:
                    continue
                doc.preamble_title = values.get('preamble_title')
                doc.preamble_author = values.get('preamble_author')
                doc.preamble_date = values.get('preamble_date') or None
                doc.save()

        # Update file metadata for the requested final application package files.
        final_requested_documents_metadata = data.get('final_requested_documents_metadata', {})
        if final_requested_documents_metadata:
            for now_application_document_xref_guid, values in final_requested_documents_metadata.items(
            ):
                doc = NOWApplicationDocumentXref.find_by_guid(now_application_document_xref_guid)
                if doc is None:
                    continue
                doc.preamble_title = values.get('preamble_title')
                doc.preamble_author = values.get('preamble_author')
                doc.preamble_date = values.get('preamble_date') or None
                doc.save()

        # Update file metadata for the previous amendment files.
        previous_amendment_documents_metadata = data.get('previous_amendment_documents_metadata',
                                                         {})
        if previous_amendment_documents_metadata:
            for permit_amendment_document_guid, values in previous_amendment_documents_metadata.items(
            ):
                doc = PermitAmendmentDocument.find_by_permit_amendment_document_guid(
                    permit_amendment_document_guid)
                if doc is None:
                    continue
                doc.preamble_title = values.get('preamble_title')
                doc.preamble_author = values.get('preamble_author')
                doc.preamble_date = values.get('preamble_date') or None
                doc.save()

        permit_amendment.save()

        return permit_amendment

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_edit_permit
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        try:
            permit_amendment.delete()
        except Exception as e:
            raise BadRequest(e)
