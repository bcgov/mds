from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy_filters import apply_pagination
from sqlalchemy.exc import DBAPIError
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit, requires_role_mine_admin, requires_role_edit_party
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.parties.response_models import PARTY
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment


class PartyResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'first_name',
        type=str,
        help='First name of the party, if the party is a person.',
        store_missing=False)
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).',
        store_missing=False)
    parser.add_argument(
        'phone_no',
        type=str,
        help='The phone number of the party. Ex: 123-123-1234',
        store_missing=False)
    parser.add_argument(
        'phone_ext',
        type=str,
        help='The extension of the phone number. Ex: 1234',
        store_missing=False)
    parser.add_argument('email', type=str, help='The email of the party.', store_missing=False)
    parser.add_argument('email', type=str, help='The email of the party.', store_missing=False)
    parser.add_argument(
        'party_type_code', type=str, help='The type of the party. Ex: PER', store_missing=False)
    parser.add_argument(
        'suite_no',
        type=str,
        store_missing=False,
        help='The suite number of the party address. Ex: 123')
    parser.add_argument(
        'address_line_1',
        type=str,
        store_missing=False,
        help='The first address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument(
        'address_line_2',
        type=str,
        store_missing=False,
        help='The second address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument(
        'city',
        type=str,
        store_missing=False,
        help='The city where the party is located. Ex: FooTown')
    parser.add_argument(
        'sub_division_code',
        type=str,
        store_missing=False,
        help='The region code where the party is located. Ex: BC')
    parser.add_argument(
        'post_code',
        type=str,
        store_missing=False,
        help='The postal code of the party address. Ex: A0B1C2')
    parser.add_argument(
        'job_title',
        type=str,
        store_missing=False,
        help='The job title of the party. Ex "Chief of Inspections"')
    parser.add_argument(
        'postnominal_letters',
        type=str,
        store_missing=False,
        help='Suffixes for a party name. Ex "BSc, PhD"')
    parser.add_argument(
        'idir_username',
        type=str,
        store_missing=False,
        help='The IDIR username of the party. Ex "IDIR\JSMITH"')

    PARTY_LIST_RESULT_LIMIT = 25

    @api.doc(
        description='Fetch a party by guid', params={
            'party_guid': 'guid of the party to fetch',
        })
    @requires_role_view_all
    @api.marshal_with(PARTY, code=200)
    def get(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound('Party not found')

        return party

    @api.expect(parser)
    @api.doc(
        description='Update a party by guid', params={'party_guid': 'guid of the party to update.'})
    @requires_role_edit_party
    @api.marshal_with(PARTY, code=200)
    def put(self, party_guid):
        data = PartyResource.parser.parse_args()
        existing_party = Party.find_by_party_guid(party_guid)
        if not existing_party:
            raise NotFound('Party not found.')

        current_app.logger.info(f'Updating {existing_party} with {data}')
        for key, value in data.items():
            if key in ['party_type_code']:
                continue     # non-editable fields from put
            setattr(existing_party, key, value)

        # We are now allowing parties to be created without an address
        if (data.get('suite_no') or data.get('address_line_1') or data.get('address_line_2')
                or data.get('city') or data.get('sub_division_code')
                or data.get('post_code')):                                                   # and check that we are changing the address
            if len(existing_party.address) == 0:
                address = Address.create()
                existing_party.address.append(address)

            for key, value in data.items():
                setattr(existing_party.address[0], key, value)

        existing_party.save()

        return existing_party

    @api.doc(
        description='Delete a party by guid', params={'party_guid': 'guid of the party to delete.'})
    @requires_role_mine_admin
    def delete(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound(f'Party guid with "{party_guid}" not found.')

        mine_party_appts = MinePartyAppointment.find_by_party_guid(party_guid)
        for mine_party_appt in mine_party_appts:
            mine_party_appt.deleted_ind = True
            mine_party_appt.save()

        party.deleted_ind = True
        party.save()
        return ('', 204)
