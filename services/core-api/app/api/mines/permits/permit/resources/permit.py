from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_MODEL


class PermitListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
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
        'permit_amendment_status_code',
        type=str,
        location='json',
        help='Status of the permit being added.')
    parser.add_argument('description', type=str, location='json', help='Permit description')
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

    @api.doc(params={'mine_guid': 'mine_guid to filter on'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_MODEL, envelope='records', code=200)
    def get(self, mine_guid):
        results = Permit.find_by_mine_guid(mine_guid)
        return results

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_MODEL, code=201)
    def post(self, mine_guid):
        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('There was no mine found with the provided mine_guid.')

        party = Party.find_by_party_guid(data.get('permittee_party_guid'))
        if not party:
            raise NotFound('Party not found')

        permit = Permit.find_by_permit_no(data.get('permit_no'))
        if permit:
            raise BadRequest("That permit number is already in use.")

        uploadedFiles = data.get('uploadedFiles', [])

        permit = Permit.create(mine.mine_guid, data.get('permit_no'),
                               data.get('permit_status_code'))

        amendment = PermitAmendment.create(
            permit,
            data.get('received_date'),
            data.get('issue_date'),
            data.get('authorization_end_date'),
            'OGP',
            description='Initial permit issued.')

        db.session.add(permit)
        db.session.add(amendment)

        for newFile in uploadedFiles:
            new_pa_doc = PermitAmendmentDocument(
                document_name=newFile['fileName'],
                document_manager_guid=newFile['document_manager_guid'],
                mine_guid=permit.mine_guid,
            )
            amendment.related_documents.append(new_pa_doc)
        db.session.commit()

        permittee_start_date = data.get('issue_date'),
        permittee = MinePartyAppointment.create(
            mine.mine_guid,
            data.get('permittee_party_guid'),
            'PMT',
            start_date=permittee_start_date,
            processed_by=self.get_user_info(),
            permit_guid=permit.permit_guid)
        db.session.add(permittee)
        db.session.commit()

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
        if not str(permit.mine_guid) == mine_guid:
            raise BadRequest('Permit and mine_guid mismatch.')
        return permit

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_MODEL, code=200)
    def put(self, permit_guid, mine_guid):
        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            raise NotFound('Permit not found.')

        if not str(permit.mine_guid) == mine_guid:
            raise BadRequest('Permit and mine_guid mismatch.')

        data = self.parser.parse_args()
        for key, value in data.items():
            if key in ['permit_no', 'mine_guid', 'uploadedFiles']:
                continue     # non-editable fields from put
            setattr(permit, key, value)

        permit.save()
        return permit
