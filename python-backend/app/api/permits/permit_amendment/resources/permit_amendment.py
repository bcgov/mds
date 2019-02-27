from flask_restplus import Resource
from ...permit.models.permit import Permit
from ..models.permit_amendment import PermitAmendment
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitAmendmentResource(Resource, UserMixin, ErrorMixin):
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
