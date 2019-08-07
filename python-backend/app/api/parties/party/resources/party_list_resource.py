import uuid
from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, InternalServerError
from sqlalchemy import and_, or_

from ..models.party import Party
from ..models.address import Address
from ..models.party_type_code import PartyTypeCode
from ...party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from ...response_models import PARTY, PAGINATED_PARTY_LIST

from app.extensions import api
from ....utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.custom_reqparser import CustomReqparser


class PartyListResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).',
        required=True)
    parser.add_argument(
        'party_type_code',
        type=str,
        help='Party type. Person (PER) or Organization (ORG).',
        required=True)
    parser.add_argument('name_search', type=str,
                        help='Name or partial name of the party.')
    parser.add_argument(
        'phone_no', type=str, help='The phone number of the party. Ex: 123-123-1234', required=True)
    parser.add_argument(
        'last_name', type=str, help='Last name of the party, if the party is a person.')
    parser.add_argument(
        'first_name', type=str, help='First name of the party, if the party is a person.')
    parser.add_argument('phone_ext', type=str,
                        help='The extension of the phone number. Ex: 1234')
    parser.add_argument('email', type=str, help='The email of the party.')
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

    PARTY_LIST_RESULT_LIMIT = 25

    @api.doc(
        description='Fetch a paginated list of parties.',
        params={
            'first_name': 'First name of party or contact',
            'party_name': 'Last name or party name of person or organisation',
            'phone_no': 'phone number',
            'email': 'email of person or organisation',
            'type': 'A person (PER) or organisation (ORG)',
            'role': 'A comma separated list of roles to be filtered by',
            'sort_field': 'enum[party_name] Default: party_name',
            'sort_dir': 'enum[asc, desc] Default: asc',
            'business_role': 'A business role or roles to filter on'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PAGINATED_PARTY_LIST, code=200)
    def get(self):
        paginated_parties, pagination_details = self.apply_filter_and_search(
            request.args)
        if not paginated_parties:
            raise BadRequest('Unable to fetch parties')

        return {
            'records': paginated_parties.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @api.expect(parser)
    @api.doc(description='Create a party.')
    @requires_role_edit_party
    @api.marshal_with(PARTY, code=200)
    def post(self, party_guid=None):
        if party_guid:
            raise BadRequest('Unexpected party id in Url.')
        data = PartyListResource.parser.parse_args()

        party = Party.create(
            data.get('party_name'),
            data.get('phone_no'),
            data.get('party_type_code'),
            # Nullable fields
            email=data.get('email'),
            first_name=data.get('first_name'),
            phone_ext=data.get('phone_ext'))

        if not party:
            raise InternalServerError('Error: Failed to create party')

        # If no address data is provided do not create an address.
        if (data.get('suite_no') or data.get('address_line_1') or data.get('address_line_2') or data.get('city') or
                data.get('sub_division_code') or data.get('post_code')):
            address = Address.create(
                suite_no=data.get('suite_no'),
                address_line_1=data.get('address_line_1'),
                address_line_2=data.get('address_line_2'),
                city=data.get('city'),
                sub_division_code=data.get('sub_division_code'),
                post_code=data.get('post_code'))
            party.address.append(address)

        party.save()
        return party

    def apply_filter_and_search(self, args):
        sort_models = {
            'party_name': 'Party',
        }

        # Handle ListView request
        items_per_page = args.get('per_page', 25)
        if items_per_page == 'all':
            items_per_page = None
        else:
            items_per_page = int(items_per_page)

        page = args.get('page', 1, type=int)
        # parse the filter terms
        first_name_filter_term = args.get('first_name', None, type=str)
        last_name_filter_term = args.get('last_name', None, type=str)
        party_name_filter_term = args.get('party_name', None, type=str)
        name_search_filter_term = args.get('name_search', None, type=str)
        type_filter_term = args.get('type', None, type=str)
        role_filter_term = args.get('role', None, type=str)
        email_filter_term = args.get('email', None, type=str)
        phone_filter_term = args.get('phone_no', None, type=str)
        sort_field = args.get('sort_field', 'party_name', type=str)
        sort_dir = args.get('sort_dir', 'asc', type=str)
        business_roles = args.getlist('business_role', None)
        sort_model = sort_models.get(sort_field)

        conditions = [Party.deleted_ind == False]
        if first_name_filter_term:
            conditions.append(Party.first_name.ilike(
                '%{}%'.format(first_name_filter_term)))
        if last_name_filter_term:
            conditions.append(Party.party_name.ilike(
                '%{}%'.format(last_name_filter_term)))
        if party_name_filter_term:
            conditions.append(Party.party_name.ilike(
                '%{}%'.format(party_name_filter_term)))
        if email_filter_term:
            conditions.append(Party.email.ilike(
                '%{}%'.format(email_filter_term)))
        if type_filter_term:
            conditions.append(Party.party_type_code.like(type_filter_term))
        if phone_filter_term:
            conditions.append(Party.phone_no.ilike(
                '%{}%'.format(phone_filter_term)))
        if role_filter_term == "NONE":
            conditions.append(Party.mine_party_appt == None)
        if name_search_filter_term:
            name_search_conditions = []
            for name_part in name_search_filter_term.strip().split(" "):
                name_search_conditions.append(
                    Party.first_name.ilike('%{}%'.format(name_part)))
                name_search_conditions.append(
                    Party.party_name.ilike('%{}%'.format(name_part)))
            conditions.append(or_(*name_search_conditions))
        contact_query = Party.query.filter(and_(*conditions))
        if role_filter_term and not role_filter_term == "NONE":
            role_filter = MinePartyAppointment.mine_party_appt_type_code.like(
                role_filter_term)
            role_query = Party.query.join(
                MinePartyAppointment).filter(role_filter)
            contact_query = contact_query.intersect(
                role_query) if contact_query else role_query
        if business_roles and len(business_roles) > 0:
            business_role_filter = PartyBusinessRoleAppointment.party_business_role_code.in_(
                business_roles)
            business_role_query = Party.query.join(PartyBusinessRoleAppointment).filter(
                business_role_filter)
            contact_query = contact_query.intersect(
                business_role_query) if contact_query else business_role_query

        # Apply sorting
        if sort_model and sort_field and sort_dir:
            sort_criteria = [{'model': sort_model,
                              'field': sort_field, 'direction': sort_dir}]
            contact_query = apply_sort(contact_query, sort_criteria)
        return apply_pagination(contact_query, page, items_per_page)
