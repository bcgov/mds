from datetime import datetime
from flask_restplus import Resource, reqparse
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from ...permit.models.permit import Permit
from ..models.permit_amendment import PermitAmendment
from ..models.permit_amendment_document import PermitAmendmentDocument
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitAmendmentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json')
    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'issue_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_view
    def get(self, permit_guid=None, permit_amendment_guid=None):
        result = []

        if permit_amendment_guid:
            permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
            if not permit_amendment:
                raise NotFound("Permit Amendment not found.")
            result = permit_amendment.json()

        elif permit_guid:
            permit = Permit.find_by_permit_guid(permit_guid)
            if not permit:
                raise BadRequest("Permit not found")
            permit_amendments = PermitAmendment.find_by_permit_id(permit.permit_id)
            result = [x.json() for x in permit_amendments]

        else:
            raise BadRequest("Provide a permit_amendment_guid or permit_guid")
        return result

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_create
    def post(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_guid:
            return self.create_error_payload(400, 'Permit_guid must be provided'), 400
        if permit_amendment_guid:
            return self.create_error_payload(400, 'unexpected permit_amendement_id'), 400

        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            return self.create_error_payload(404, 'permit does not exist'), 404

        data = self.parser.parse_args()
        current_app.logger.info(f'creating permit_amendment with >> {data}')

        received_date = data.get('received_date')
        issue_date = data.get('issue_date')
        authorization_end_date = data.get('authorization_end_date')
        permit_amendment_type_code = data.get('permit_amendment_type_code', 'AMD')
        description = data.get('description')
        uploadedFiles = data.get('uploadedFiles', [])

        party = Party.find_by_party_guid(data.get('permittee_party_guid'))
        if not party:
            raise NotFound('Party not found')

        party_is_active_permittee = False

        permittees = MinePartyAppointment.find_by_permit_guid(permit_guid)

        for permittee in permittees:
            if permittee.end_date is None:
                if permittee.party_guid == party.party_guid:
                    party_is_active_permittee = True
                else:  # inactive old permittees
                    permittee.end_date = datetime.utcnow()
                    permittee.save()

        if not party_is_active_permittee:
            new_permittee = MinePartyAppointment.create(permit.mine_guid,
                                                        data.get('permittee_party_guid'), 'PMT',
                                                        datetime.utcnow(), None, self.get_user_info(),
                                                        permit_guid, True)
            new_permittee.save()

        try:
            new_pa = PermitAmendment.create(
                permit,
                received_date,
                issue_date,
                authorization_end_date,
                permit_amendment_type_code,
                description=description,
                save=True)

            for newFile in uploadedFiles:
                new_pa_doc = PermitAmendmentDocument(
                    document_name=newFile['fileName'],
                    document_manager_guid=newFile['document_manager_guid'],
                    mine_guid=permit.mine_guid,
                )
                new_pa.documents.append(new_pa_doc)
            new_pa.save()
        except Exception as e:
            return self.create_error_payload(500, 'Error: {}'.format(e)), 500
        return new_pa.json()

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_create
    def put(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_amendment_guid:
            return self.create_error_payload(400, 'permit_amendment_id must be provided'), 400
        pa = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not pa:
            return self.create_error_payload(404, 'permit amendment not found'), 404

        data = self.parser.parse_args()
        current_app.logger.info(f'updating {pa} with >> {data}')

        for key, value in data.items():
            if key == 'uploadedFiles':
                for newFile in value:
                    new_pa_doc = PermitAmendmentDocument(
                        document_name=newFile['fileName'],
                        document_manager_guid=newFile['document_manager_guid'],
                        mine_guid=pa.permit.mine_guid,
                    )
                    pa.documents.append(new_pa_doc)
                pa.save()
            else:
                setattr(pa, key, value)

        return pa.json()

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_admin
    def delete(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_amendment_guid:
            return self.create_error_payload(400, 'permit_amendment_id must be provided'), 400
        pa = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not pa:
            return self.create_error_payload(404, 'permit amendment not found'), 404

        pa.deleted_ind = True

        try:
            pa.save()
        except Exception as e:
            return self.create_error_payload(500, 'Error: {}'.format(e)), 500
        return ('', 204)
