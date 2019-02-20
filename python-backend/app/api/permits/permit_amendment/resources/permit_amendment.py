from flask_restplus import Resource, reqparse
from ...permit.models.permit import Permit
from ..models.permit_amendment import PermitAmendment
from ..models.permit_ammendment_document_xref import PermitAmendmentDocumentXref
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitAmendmentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'received_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument(
        'issue_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument(
        'authorization_end_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument('permit_amendment_type_code', type=str)
    parser.add_argument('permit_amendment_status_code', type=str)
    parser.add_argument('mine_document_guid', type=str)

    @api.doc(params={'permit_amendment_id': 'Permit amendment id.', 'permit_guid': 'Permit GUID'})
    @requires_role_mine_view
    def get(self, permit_guid=None, permit_amendment_id=None):

        if permit_amendment_id:
            permit_amendment = PermitAmendment.find_by_permit_amendment_id(permit_amendment_id)
            if permit_amendment:
                return permit_amendment.json()

        if permit_guid:
            permit = Permit.find_by_permit_guid(permit_guid)
            if permit:
                permit_amendments = PermitAmendment.find_by_permit_id(permit.permit_id)
                if permit_amendments:
                    result = {'amendments': [x.json() for x in permit_amendments]}
                    return result

        return self.create_error_payload(404, 'Permit amendment(s) not found'), 404

    @requires_role_mine_view
    def post(self, permit_guid=None, permit_amendment_id=None):
        if not permit_guid:
            return self.create_error_payload(400, 'Permit_guid must be provided')
        if permit_amendment_id:
            return self.create_error_payload(400, 'unexpected permit_amendement_id')

        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            return self.create_error_payload(404, 'permit does not exist')

        data = self.parser.parse_args()

        received_date = data.get('received_date')
        issue_date = data.get('issue_date')
        authorization_end_date = data.get('authorization_end_date')

        new_pa = PermitAmendment.create(
            permit,
            received_date,
            issue_date,
            authorization_end_date,
            self.get_create_update_dict(),
            save=True)

        return permit.json()