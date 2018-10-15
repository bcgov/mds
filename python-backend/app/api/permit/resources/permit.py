from flask_restplus import Resource
from ..models.permit import Permit
from app.extensions import jwt
from ...utils.resources_mixins import UserMixin, ErrorMixin


class PermitResource(Resource, UserMixin, ErrorMixin):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, permit_guid):
        permit = Permit.find_by_permit_guid(permit_guid)
        if permit:
            return permit.json()
        return self.create_error_payload(404, 'Permit not found'), 404
