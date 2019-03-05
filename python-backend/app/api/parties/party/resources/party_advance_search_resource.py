import uuid
from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from sqlalchemy import and_

from ..models.party import Party
from ..models.party_type_code import PartyTypeCode
from ...party_appt.models.mine_party_appt import MinePartyAppointment

from ....constants import PARTY_STATUS_CODE
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_any_of, MINE_VIEW, MINESPACE_PROPONENT

from ....utils.resources_mixins import UserMixin, ErrorMixin


class PartyAdvancedSearchResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str,
        help='First name of the party, if the party is a person.')
    parser.add_argument('last_name', type=str,
                        help='Last name of the party, if the party is a person.')
    parser.add_argument('party_name', type=str,
        help='Last name of the party (Person), or the Organization name (Organization).')
    parser.add_argument('phone_no', type=str,
        help='The phone number of the party. Ex: 123-123-1234')
    parser.add_argument('phone_ext', type=str, help='The extension of the phone number. Ex: 1234')
    parser.add_argument('email', type=str, help='The email of the party.')
    parser.add_argument('type', type=str, help='The type of the party. Ex: PER')
    parser.add_argument('page', type=int, help='The page of the results.')
    parser.add_argument('per_page', type=int, help='The number of parties per page.')
    parser.add_argument('role', type=str, help='The role of a user. Ex: MMG for Mine Manager')
    PARTY_LIST_RESULT_LIMIT = 25


    @api.doc(
        params={
            'first_name': 'First name of party or contact',
            'party_name': 'Last name or party name of person or organisation',
            'phone_no': 'phone number',
            'email': 'email of person or organisation',
            'type': 'A person (PER) or organisation (ORG)',
            'role': 'A comma separated list of roles to be filtered by'
        })
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):
        paginated_parties, pagination_details = self.apply_filter_and_search(request.args)
        if not paginated_parties:
            self.raise_error(
                404,
                'No parties found'
            ), 404
        parties = paginated_parties.all()
        return {
            'parties': list(map(lambda x: x.json(relationships=['mine_party_appt']), parties)),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    def apply_filter_and_search(self, args):
        # Handle ListView request
        items_per_page = args.get('per_page', 25, type=int)
        page = args.get('page', 1, type=int)
        # parse the filter terms
        first_name_filter_term = args.get('first_name', None, type=str)
        last_name_filter_term = args.get('last_name', None, type=str)
        party_name_filter_term = args.get('party_name', None, type=str)
        type_filter_term = args.get('type', None, type=str)
        role_filter_term = args.get('role', None, type=str)
        email_filter_term = args.get('email', None, type=str)
        phone_filter_term = args.get('phone_no', None, type=str)

        conditions = []
        if first_name_filter_term and len(first_name_filter_term.strip()) > 0:
            conditions.append(Party.first_name.ilike('%{}%'.format(first_name_filter_term.strip())))
        if last_name_filter_term and len(last_name_filter_term.strip()) > 0:
            conditions.append(Party.party_name.ilike('%{}%'.format(last_name_filter_term.strip())))
        if party_name_filter_term and len(party_name_filter_term.strip()) > 0:
            conditions.append(Party.party_name.ilike('%{}%'.format(party_name_filter_term.strip())))
        if email_filter_term and len(email_filter_term.strip()) > 0:
            conditions.append(Party.email.ilike('%{}%'.format(email_filter_term.strip())))
        if type_filter_term:
            conditions.append(Party.party_type_code.like(type_filter_term))
        if phone_filter_term:
            conditions.append(Party.phone_no.ilike('%{}%'.format(phone_filter_term)))
        contact_query = Party.query.filter(and_(*conditions))
        if role_filter_term:
            role_filter_term_array = role_filter_term.split(',')
            role_filter = MinePartyAppointment.mine_party_appt_type_code.in_(role_filter_term_array)
            role_query = Party.query.join(MinePartyAppointment).filter(role_filter)
            contact_query = contact_query.intersect(role_query) if contact_query else role_query

        sort_criteria = [{'model': 'Party', 'field': 'party_name', 'direction': 'asc'}]
        contact_query = apply_sort(contact_query, sort_criteria)
        return apply_pagination(contact_query, page, items_per_page)
