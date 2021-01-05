from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_MODEL


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

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('There was no mine found with the provided mine_guid.')

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
            else:            #covering situation where 'P-DRAFT-None' causes a non-unique error
                permit_no = permit_prefix + '-DRAFT-' + str(mine.mine_no)

        permit = Permit.find_by_permit_no(permit_no)
        if permit:
            raise BadRequest("That permit number is already in use.")

        uploadedFiles = data.get('uploadedFiles', [])

        permit = Permit.create(mine, permit_no, data.get('permit_status_code'),
                               data.get('is_exploration'))

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
            now_application_guid=data.get('now_application_guid'))

        db.session.add(permit)
        db.session.add(amendment)

        now_application_guid = data.get('now_application_guid')
        if now_application_guid is not None and permit.permit_status_code == 'D':
            application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
            if application_identity.now_application:
                now_type = application_identity.now_application.notice_of_work_type_code
                condition_code = now_type

                if now_type == "QIM":
                    condition_code = "QCA"
                elif now_type == "COL":
                    condition_code = "MIN"

                standard_conditions = StandardPermitConditions.find_by_notice_of_work_type_code(
                    condition_code)
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
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_MODEL, code=200)
    def put(self, permit_guid, mine_guid):
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)
        if not permit:
            raise NotFound('Permit not found.')

        data = self.parser.parse_args()
        for key, value in data.items():
            if key in ['permit_no', 'mine_guid', 'uploadedFiles']:
                continue     # non-editable fields from put
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