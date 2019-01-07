from flask_restplus import Resource
from ..models.permit import Permit
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_view
    def get(self, permit_guid):
        permit = Permit.find_by_permit_guid(permit_guid)
        if permit:
            return permit.json()
        return self.create_error_payload(404, 'Permit not found'), 404
