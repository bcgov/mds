from datetime import datetime, timedelta
import uuid

from flask_restplus import Resource, reqparse
from ..models.party import Party
from ..models.permit import Permit
from ..models.permittee import Permittee
from app.extensions import jwt
from .mixins import UserMixin


class PermitteeResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('party_guid', type=str)
    parser.add_argument('permittee_guid', type=str)
    parser.add_argument('permit_guid', type=str)
    parser.add_argument('effective_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d'))

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
    def post(self, permittee_guid=None):
        if permittee_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Unexpected permittee id in Url.'
                }
            }, 400
        data = PermitteeResource.parser.parse_args()
        effective_date = data['effective_date']
        party_guid = data['party_guid']
        _permittee_guid = data['permittee_guid']
        permit_guid = data['permit_guid']
        if not party_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: No party guid is not provided.'
                }
            }, 400
        if not permit_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: No permit guid is not provided.'
                }
            }, 400
        if not _permittee_guid:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: No permittee guid is not provided.'
                }
            }
        if not effective_date:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: Effective date is not provided.'
                }
            }, 400
        permittee_exists = Permittee.find_by_permittee_guid(_permittee_guid)
        if not permittee_exists:
            return {
                'error': {
                    'status': 404,
                    'message': 'Permittee not found'
                }
            }, 404
        party_exists = Party.find_by_party_guid(party_guid)
        if not party_exists:
            return {
                'error': {
                    'status': 404,
                    'message': 'Party not found'
                }
            }, 404
        permit_exists = Permit.find_by_permit_guid(permit_guid)
        if not permit_exists:
            return {
                'error': {
                    'status': 404,
                    'message': 'Permit not found'
                }
            }, 404
        try:
            permittee = Permittee(
                permittee_guid=uuid.uuid4(),
                permit_guid=permit_guid,
                party_guid=party_guid,
                effective_date=effective_date,
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            return {
                'error': {
                    'status': 400,
                    'message': 'Error: {}'.format(e)
                }
            }, 400
        permittee_exists.expiry_date = effective_date - timedelta(days=1)
        permittee.save()
        permittee_exists.save()
        return permittee.json()
