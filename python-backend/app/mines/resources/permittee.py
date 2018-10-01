from flask_restplus import Resource, reqparse
from ..models.permittee import Permittee
from ..models.permit import Permit
from app.extensions import jwt
from .mixins import UserMixin


class PermitteeResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('party_guid', type=str)

    @jwt.requires_roles(["mds-mine-view"])
    def get(self, permittee_guid):
        permittee = Permittee.find_by_permittee_guid(permittee_guid)
        if permittee:
            return permittee.json()
        return {
            'error': {
                'status': 404,
                'message': 'Permittee not found'
            }
        }, 404

    @jwt.requires_roles(["mds-mine-create"])
    def put(self, permittee_guid):
        data = PermitteeResource.parser.parse_args()
        party_guid = data['party_guid']
        if not party_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: No party guid filled.'
                }
            }, 400
        permittee = Permittee.find_by_permittee_guid(permittee_guid)
        if not permittee:
            return {
                'error': {
                    'status': 404,
                    'message': 'Permittee not found'
                }
            }, 404
        party_exists = Permit.find_by_party_guid(party_guid)
        if not party_exists:
            return {
                'error': {
                    'status': 404,
                    'message': 'Party not found'
                }
            }, 404
        permittee.party_guid = party_exists.party_guid
        permittee.save()

        return permittee.json()
