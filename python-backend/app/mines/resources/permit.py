from flask_restplus import Resource
from ..models.permit import Permit
from app.extensions import jwt
from .mixins import UserMixin


class PermitResource(Resource, UserMixin):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, permit_guid):
        permit = Permit.find_by_permit_guid(permit_guid)
        if permit:
            return permit.json()
        return {
            'error': {
                'status': 404,
                'message': 'Permit not found'
            }
        }, 404
