from datetime import datetime, timedelta
import uuid

from flask_restplus import Resource, reqparse
from ...party.models.party import Party
from ...permit.models.permit import Permit
from ..models.permittee import Permittee
from app.extensions import jwt
from ...utils.resources_mixins import UserMixin, ErrorMixin


class PermitteeResource(Resource, UserMixin, ErrorMixin):
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
        return self.create_error_payload(404, 'Permittee not found'), 404

    @jwt.requires_roles(["mds-mine-create"])
    def post(self, permittee_guid=None):
        if permittee_guid:
            self.raise_error(400, 'Error: Unexpected permittee id in Url.')
        data = PermitteeResource.parser.parse_args()
        effective_date = data['effective_date']
        party_guid = data['party_guid']
        _permittee_guid = data['permittee_guid']
        permit_guid = data['permit_guid']
        if not party_guid:
            self.raise_error(400, 'Error: No party guid is not provided.')
        if not permit_guid:
            self.raise_error(400, 'Error: No permit guid is not provided.')
        if not _permittee_guid:
            self.raise_error(400, 'Error: No permittee guid is not provided.')
        if not effective_date:
            self.raise_error(400, 'Error: Effective date is not provided.')
        permittee_exists = Permittee.find_by_permittee_guid(_permittee_guid)
        if not permittee_exists:
            self.raise_error(400, 'Permittee not found')
        party_exists = Party.find_by_party_guid(party_guid)
        if not party_exists:
            return self.create_error_payload(404, 'Party not found'), 404
        permit_exists = Permit.find_by_permit_guid(permit_guid)
        if not permit_exists:
            return self.create_error_payload(404, 'Permit not found'), 404
        try:
            permittee = Permittee(
                permittee_guid=uuid.uuid4(),
                permit_guid=permit_guid,
                party_guid=party_guid,
                effective_date=effective_date,
                **self.get_create_update_dict()
            )
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))
        permittee_exists.expiry_date = effective_date - timedelta(days=1)
        permittee.save()
        permittee_exists.save()
        return permittee.json()
