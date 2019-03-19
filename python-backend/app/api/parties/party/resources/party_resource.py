import uuid
from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy_filters import apply_pagination
from sqlalchemy.exc import DBAPIError

from ..models.party import Party
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PartyResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'first_name', type=str, help='First name of the party, if the party is a person.')
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).')
    parser.add_argument(
        'phone_no', type=str, help='The phone number of the party. Ex: 123-123-1234')
    parser.add_argument('phone_ext', type=str, help='The extension of the phone number. Ex: 1234')
    parser.add_argument('email', type=str, help='The email of the party.')
    parser.add_argument('type', type=str, help='The type of the party. Ex: PER')
    parser.add_argument('suite_no',
                        type=str,
                        store_missing=False,
                        help='The suite number of the party address. Ex: 123')
    parser.add_argument('address_line_1',
                        type=str,
                        store_missing=False,
                        help='The first address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument('address_line_2',
                        type=str,
                        store_missing=False,
                        help='The second address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument('city',
                        type=str,
                        store_missing=False,
                        help='The city where the party is located. Ex: FooTown')
    parser.add_argument('sub_division_code',
                        type=str,
                        store_missing=False,
                        help='The region code where the party is located. Ex: BC')
    parser.add_argument('post_code',
                        type=str,
                        store_missing=False,
                        help='The postal code of the party address. Ex: A0B1C2')

    PARTY_LIST_RESULT_LIMIT = 25

    @api.doc(
        params={
            'party_guid': 'Party guid. If not provided a list of 100 parties will be returned.',
            '?search':
            'Term searched in first name and party name, and 100 parties will be returned.',
            '?type': 'Search will filter for the type indicated.',
            '?relationships': 'Related record types to return as nested objects'
        })
    @requires_role_mine_view
    def get(self, party_guid=None):
        if party_guid:
            try:
                party = Party.find_by_party_guid(party_guid)
            except DBAPIError:
                return self.create_error_payload(422, 'Invalid Party guid'), 422

            if party:
                return party.json()
            else:
                return self.create_error_payload(404, 'Party not found'), 404
        else:
            search_term = request.args.get('search')
            search_type = request.args.get('type').upper() if request.args.get('type') else None
            items_per_page = request.args.get('per_page', 25, type=int)
            page = request.args.get('page', 1, type=int)
            parties = Party.query
            if search_term:
                if search_type in ['PER', 'ORG']:
                    parties = Party.search_by_name(search_term, search_type,
                                                   self.PARTY_LIST_RESULT_LIMIT)
                else:
                    parties = Party.search_by_name(
                        search_term, query_limit=self.PARTY_LIST_RESULT_LIMIT)

            paginated_parties, pagination_details = apply_pagination(parties, page, items_per_page)
            if not paginated_parties:
                self.raise_error(
                    404,
                    'No parties found'
                ), 404
            parties = paginated_parties.all()
            relationships = request.args.get('relationships')
            relationships = relationships.split(',') if relationships else []
            return {
                'parties': list(map(lambda x: x.json(relationships=relationships), parties)),
                'current_page': pagination_details.page_number,
                'total_pages': pagination_details.num_pages,
                'items_per_page': pagination_details.page_size,
                'total': pagination_details.total_results,
            }

    @api.expect(parser)
    @requires_role_mine_create
    def post(self, party_guid=None):
        if party_guid:
            self.raise_error(400, 'Error: Unexpected party id in Url.')
        data = PartyResource.parser.parse_args()

        try:
            party = Party.create(data['party_name'],
                                 data['phone_no'],
                                 data['type'],
                                 self.get_create_update_dict(),
                                 # Nullable fields
                                 email=data.get('email'),
                                 first_name=data.get('first_name'),
                                 phone_ext=data.get('phone_ext'),
                                 suite_no=data.get('suite_no'),
                                 address_line_1=data.get('address_line_1'),
                                 address_line_2=data.get('address_line_2'),
                                 city=data.get('city'),
                                 sub_division_code=data.get('sub_division_code'),
                                 post_code=data.get('post_code'))
        except KeyError as e:
            self.raise_error(400, 'Error: Missing value for required field(s)')
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))

        if not party:
            self.raise_error(400, 'Error: Failed to create party')

        party.save()
        return party.json()

    @api.expect(parser)
    @requires_role_mine_create
    def put(self, party_guid):
        data = PartyResource.parser.parse_args()
        existing_party = Party.find_by_party_guid(party_guid)
        if not existing_party:
            return self.create_error_payload(404, 'Party not found'), 404

        try:
            existing_party.party_name        = data.get('party_name') or existing_party.party_name
            existing_party.phone_no          = data.get('phone_no') or existing_party.phone_no
            existing_party.party_type_code   = data.get('type') or existing_party.party_type_code
            existing_party.first_name        = data.get('first_name') or existing_party.first_name
            # Nullable fields
            existing_party.email             = data.get('email') if 'email' in data else existing_party.email
            existing_party.suite_no          = data.get('suite_no') if 'suite_no' in data else existing_party.suite_no
            existing_party.address_line_1    = data.get('address_line_1') if 'address_line_1' in data else existing_party.address_line_1
            existing_party.address_line_2    = data.get('address_line_2') if 'address_line_2' in data else existing_party.address_line_2
            existing_party.city              = data.get('city') if 'city' in data else existing_party.city
            existing_party.sub_division_code = data.get('sub_division_code') if 'sub_division_code' in data else existing_party.sub_division_code
            existing_party.post_code         = data.get('post_code') if 'post_code' in data else existing_party.post_code

            existing_party.save()
        except AssertionError as e:
            self.raise_error(400, 'Error: {}'.format(e))

        return existing_party.json()
