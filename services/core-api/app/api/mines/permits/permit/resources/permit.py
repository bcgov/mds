import json
from flask_restx import Resource, reqparse, inputs
from datetime import datetime
from datetime import datetime, timezone
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.application_type_code import ApplicationTypeCode
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_role_edit_securities, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_MODEL
from app.api.mines.mine.resources.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.utils.helpers import generate_draft_permit_no_suffix, get_preamble_text


class PermitListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'now_application_guid',
        type=str,
        help='Returns any draft permit and draft permit amendments related to this application.')
    parser.add_argument(
        'permit_no', type=str, help='Number of the permit being added.', location='json')
    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json')
    parser.add_argument(
        'permit_status_code', type=str, location='json', help='Status of the permit being added.')
    parser.add_argument(
        'received_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
    parser.add_argument(
        'issue_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
    parser.add_argument(
        'authorization_end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
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
        'is_exploration',
        type=bool,
        location='json',
        help='Whether the permit is an exploration permit or not.')
    parser.add_argument('description', type=str, location='json', help='Permit description')
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'exemption_fee_status_code',
        type=str,
        help='Fee exemption status for the mine.',
        trim=True,
        store_missing=False,
        location='json')
    parser.add_argument(
        'exemption_fee_status_note',
        type=str,
        help='Fee exemption status note for the mine.',
        trim=True,
        location='json')
    parser.add_argument(
        'site_properties',
        type=json.dumps,
        store_missing=False,
        help='It includes object of string codes for mine_commodity_code and mine_disturbance_code.',
        location='json')
    parser.add_argument('liability_adjustment', type=str, location='json', store_missing=False)
    parser.add_argument(
        'security_received_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument('security_not_required', location='json', type=bool, store_missing=False)
    parser.add_argument(
        'security_not_required_reason', location='json', type=str, store_missing=False)

    @api.doc(params={'mine_guid': 'mine_guid to filter on'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_MODEL, envelope='records', code=200)
    def get(self, mine_guid):
        now_application_guid = request.args.get('now_application_guid')
        if now_application_guid:
            current_app.logger.info('Supplied now_application_guid: ' + str(now_application_guid))
        if now_application_guid is not None:
            permit = Permit.find_by_now_application_guid(now_application_guid)
            results = [permit] if permit else []
        else:
            results = Mine.find_by_mine_guid(mine_guid).mine_permit
        return results

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_MODEL, code=201)
    def post(self, mine_guid):
        data = self.parser.parse_args()
        permit_no = data.get('permit_no')
        data['site_properties'] = json.loads(data.get('site_properties', '{}'))

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('There was no mine found with the provided mine_guid.')

        identity = NOWApplicationIdentity.find_by_mine_guid(mine.mine_guid)
        application_type_description = None
        if identity:
            application_type = ApplicationTypeCode.find_by_application_type_code(
                identity.application_type_code)
            application_type_description = application_type.description if application_type else None

        permittee_party_guid = data.get('permittee_party_guid')
        if permittee_party_guid:
            party = Party.find_by_party_guid(permittee_party_guid)
            if not party:
                raise NotFound('Permittee party not found')

        if not permit_no:
            now_application_guid = data.get('now_application_guid')
            if not now_application_guid:
                raise NotFound('There was no Notice of Work found with the provided guid.')

            now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
            now_application = now_application_identity.now_application
            notice_of_work_type_code = now_application.notice_of_work_type_code[0]

            permit_prefix = notice_of_work_type_code if notice_of_work_type_code != 'S' else 'G'
            if permit_prefix in ['M', 'C'] and data.get('is_exploration'):
                permit_prefix = permit_prefix + 'X'

            if now_application_identity.now_number is not None:
                permit_no = permit_prefix + '-DRAFT-' + str(now_application_identity.now_number)
            # Handle the situation where 'P-DRAFT-None' causes a non-unique error
            else:
                permit_no = permit_prefix + '-DRAFT-' + str(mine.mine_no)

            last_draft_permit = Permit.find_by_permit_no_deleted_in_draft(permit_no)
            if last_draft_permit:
                permit_no = generate_draft_permit_no_suffix(last_draft_permit.permit_no, permit_no)

        permit = Permit.find_by_permit_no(permit_no)
        if permit:
            raise BadRequest("That permit number is already in use.")

        uploadedFiles = data.get('uploadedFiles', [])

        # we do not have permit yet so we will use the hybrid property logic at this point
        permit_prefix = permit_no[0]
        Permit.validate_exemption_fee_status(
            data.get('is_exploration'), data.get('permit_status_code'), permit_prefix,
            data.get('site_properties', {}).get('mine_disturbance_code'),
            data.get('site_properties', {}).get('mine_tenure_type_code'),
            data.get('exemption_fee_status_code'))

        permit = Permit.create(mine, permit_no, data.get('permit_status_code'),
                               data.get('is_exploration'), data.get('exemption_fee_status_code'),
                               data.get('exemption_fee_status_note'))

        is_generated_in_core = True if permit.permit_status_code == 'D' else False

        amendment = PermitAmendment.create(
            permit,
            mine,
            data.get('received_date'),
            data.get('issue_date'),
            data.get('authorization_end_date'),
            'OGP',
            description='Initial permit issued.',
            issuing_inspector_title=data.get('issuing_inspector_title'),
            regional_office=data.get('regional_office'),
            now_application_guid=data.get('now_application_guid'),
            liability_adjustment=data.get('liability_adjustment'),
            security_received_date=data.get('security_received_date'),
            security_not_required=data.get('security_not_required'),
            security_not_required_reason=data.get('security_not_required_reason'),
            is_generated_in_core=is_generated_in_core)

        db.session.add(permit)
        db.session.add(amendment)

        now_application_guid = data.get('now_application_guid')
        if now_application_guid is not None and permit.permit_status_code == 'D':
            application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)

            application_type_description = None
            if application_identity:
                application_type = ApplicationTypeCode.find_by_application_type_code(
                    application_identity.application_type_code)
                application_type_description = 'application' if application_type.application_type_code == 'ADA' else application_type.description
                amendment.preamble_text = get_preamble_text(
                    application_type_description) if is_generated_in_core else None

            if application_identity.now_application:
                now_type = application_identity.now_application.notice_of_work_type_code

                standard_conditions = StandardPermitConditions.find_by_notice_of_work_type_code(
                    now_type)
                for condition in standard_conditions:
                    PermitConditions.create(condition.condition_category_code,
                                            condition.condition_type_code,
                                            amendment.permit_amendment_id, condition.condition,
                                            condition.display_order, condition.sub_conditions)
                db.session.commit()

        for newFile in uploadedFiles:
            new_pa_doc = PermitAmendmentDocument(
                document_name=newFile['fileName'],
                document_manager_guid=newFile['document_manager_guid'],
                mine_guid=mine.mine_guid,
            )
            amendment.related_documents.append(new_pa_doc)
        db.session.commit()

        if permittee_party_guid:
            permittee_start_date = data.get('issue_date')
            permittee = MinePartyAppointment.create(
                None,
                permittee_party_guid,
                mine_party_appt_type_code='PMT',
                start_date=permittee_start_date,
                processed_by=self.get_user_info(),
                permit=permit)
            permittee.assign_related_guid('PMT', permit.permit_guid)
            db.session.add(permittee)
            db.session.commit()

        #for marshalling
        permit._context_mine = mine
        return permit


class PermitResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'permit_no', type=str, help='Number of the permit being added.', location='json')
    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'permit_status_code',
        type=str,
        location='json',
        help='Status of the permit being added.',
        store_missing=False)
    parser.add_argument(
        'remaining_static_liability', type=str, location='json', store_missing=False)
    parser.add_argument(
        'received_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument(
        'issue_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json',
        store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code',
        type=str,
        location='json',
        help='Status of the permit being added.',
        store_missing=False)
    parser.add_argument(
        'description', type=str, location='json', help='Permit description', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'now_application_guid',
        type=str,
        help='GUID of the NoW application for the specified permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'exemption_fee_status_code',
        type=str,
        help='Fee exemption status for the mine.',
        trim=True,
        store_missing=False,
        location='json')
    parser.add_argument(
        'exemption_fee_status_note',
        type=str,
        help='Fee exemption status note for the mine.',
        trim=True,
        store_missing=False,
        location='json')

    parser.add_argument(
        'site_properties',
        type=json.dumps,
        location='json',
        store_missing=False,
        help='{ mine_commodity_code, mine_disturbance_code}.')

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_MODEL, code=200)
    def get(self, permit_guid, mine_guid):
        permit = Permit.find_by_permit_guid_or_no(permit_guid)
        if not permit:
            raise NotFound('Permit not found.')
        if mine_guid not in [str(m.mine_guid) for m in permit._all_mines]:
            raise BadRequest('Permit and mine_guid mismatch.')
        return permit

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_edit_securities
    @api.marshal_with(PERMIT_MODEL, code=200)
    def put(self, permit_guid, mine_guid):
        data = self.parser.parse_args()
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)
        data['site_properties'] = json.loads(data.get('site_properties', '{}'))
        if not permit:
            raise NotFound('Permit not found.')

        is_exploration = permit.permit_no[1] == "X" or permit.is_exploration
        Permit.validate_exemption_fee_status(
            is_exploration, data.get('permit_status_code'), permit.permit_prefix,
            data.get('site_properties', {}).get('mine_disturbance_code'),
            data.get('site_properties', {}).get('mine_tenure_type_code'),
            data.get('exemption_fee_status_code'))

        if data.get('site_properties') != {}:
            MineType.create_or_update_mine_type_with_details(
                mine_guid=mine_guid,
                permit_guid=permit_guid,
                mine_tenure_type_code=data.get('site_properties', {}).get('mine_tenure_type_code'),
                mine_disturbance_codes=data.get('site_properties',
                                                {}).get('mine_disturbance_code', []),
                mine_commodity_codes=data.get('site_properties', {}).get('mine_commodity_code', []))

        # If the permit status has changed, update the "status changed" timestamp.
        permit_status_code = data.get('permit_status_code')
        if permit_status_code and permit_status_code != permit.permit_status_code:
            permit.status_changed_timestamp = datetime.now(timezone.utc)

        for key, value in data.items():
            if key in ['permit_no', 'mine_guid', 'uploadedFiles', 'site_properties']:
                continue     # non-editable fields from put or should be handled separately
            setattr(permit, key, value)

        permit.save()
        return permit

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_admin
    @api.response(204, 'Successfully deleted.')
    def delete(self, permit_guid, mine_guid):
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)
        if not permit:
            raise NotFound('Permit not found.')

        try:
            permit.delete()
        except Exception as e:
            raise BadRequest(e)

        return None, 204

    @api.doc(params={'permit_guid': 'Permit guid.', 'now_application_guid': 'NoW application guid'})
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_MODEL, code=200)
    def patch(self, permit_guid, mine_guid):
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)

        if not permit:
            raise NotFound('Permit not found.')

        now_application_guid = self.parser.parse_args()['now_application_guid']
        now_application = NOWApplication.find_by_application_guid(now_application_guid)

        if not now_application:
            raise NotFound('NoW application not found')

        if permit.permit_status_code == 'D':
            #assign permit_no
            permit.assign_permit_no(now_application.notice_of_work_type_code[0])

        permit.save()
        return permit