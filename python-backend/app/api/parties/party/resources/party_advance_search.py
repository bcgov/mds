import uuid
from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters, \
from sqlalchemy import or_

from ..models.party import Party
from ....constants import PARTY_STATUS_CODE
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PartyAdvancedSearch(Resource, UserMixin, ErrorMixin):
    #TODO: parse the new filters and searchables
    # SEARCHES
    # first_name
    # party_name,
    #
    # FILTERS
    # associated mine Id,
    # phone,
    # email,
    # role,
    # person vs orginization
    parser = reqparse.RequestParser()
    parser.add_argument('first_name', type=str,
        help='First name of the party, if the party is a person.')
    parser.add_argument('party_name', type=str,
        help='Last name of the party (Person), or the Organization name (Organization).')
    #FILTERS
    parser.add_argument('phone_no', type=str,
        help='The phone number of the party. Ex: 123-123-1234')
    parser.add_argument('phone_ext', type=str, help='The extension of the phone number. Ex: 1234')
    parser.add_argument('email', type=str, help='The email of the party.')
    parser.add_argument('type', type=str, help='The type of the party. Ex: PER')
    parser.add_argument('page', type=int, help='The page of the results.')
    parser.add_argument('per_page', type=int, help='The number of parties per page.')
    parser.add_argument('role', type=str, help='The role of a user. Ex: MMG for Mine Manager')
    PARTY_LIST_RESULT_LIMIT = 25

    # @api.doc(
    #     params={
    #         'party_guid': 'Party guid. If not provided a list of 100 parties will be returned.',
    #         '?search':
    #         'Term searched in first name and party name, and 100 parties will be returned.',
    #         '?type': 'Search will filter for the type indicated.'
    #     })
    # @requires_role_mine_view
    # def get(self, party_guid=None):
    #     if party_guid:
    #         party = Party.find_by_party_guid(party_guid)
    #         if party:
    #             return party.json()
    #         else:
    #             return self.create_error_payload(404, 'Party not found'), 404
    #     else:
    #         search_term = request.args.get('search')
    #         search_type = request.args.get('type').upper() if request.args.get('type') else None
    #         items_per_page = request.args.get('per_page', 25, type=int)
    #         page = request.args.get('page', 1, type=int)
    #         parties = Party.query
    #         if search_term:
    #             if search_type in ['PER', 'ORG']:
    #                 parties = Party.search_by_name(search_term, search_type,
    #                                                self.PARTY_LIST_RESULT_LIMIT)
    #             else:
    #                 parties = Party.search_by_name(
    #                     search_term, query_limit=self.PARTY_LIST_RESULT_LIMIT)
    #
    #         paginated_parties, pagination_details = apply_pagination(parties, page, items_per_page)
    #         if not paginated_parties:
    #             self.raise_error(
    #                 404,
    #                 'No parties found'
    #             ), 404
    #         parties = paginated_parties.all()
    #         return {
    #             'parties': list(map(lambda x: x.json(), parties)),
    #             'current_page': pagination_details.page_number,
    #             'total_pages': pagination_details.num_pages,
    #             'items_per_page': pagination_details.page_size,
    #             'total': pagination_details.total_results,
    #         }

    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, help='Name of the mine.')
    parser.add_argument('note', type=str, help='Any additional notes to be added to the mine.')
    parser.add_argument('tenure_number_id', type=int, help='Tenure number for the mine.')
    parser.add_argument(
        'longitude', type=lambda x: Decimal(x) if x else None, help='Longitude point for the mine.')
    parser.add_argument(
        'latitude', type=lambda x: Decimal(x) if x else None, help='Latitude point for the mine.')
    parser.add_argument(
        'mine_status',
        action='split',
        help=
        'Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code '
    )
    parser.add_argument(
        'major_mine_ind',
        type=inputs.boolean,
        help='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".')
    parser.add_argument('mine_region', type=str, help='Region for the mine.')

    @api.doc(
        params={
            'mine_no_or_guid':
            'Mine number or guid. If not provided a paginated list of mines will be returned.'
        })
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self, mine_no_or_guid=None):
        # ToDo: figure out what the logic behind mine guid stuff was
        if mine_no_or_guid:
            mine = Mine.find_by_mine_no_or_guid(mine_no_or_guid)
            if mine:
                return mine.json()
            return self.create_error_payload(404, 'Mine not found'), 404
        else:
            paginated_contact_query, pagination_details = self.apply_filter_and_search(request.args)
            contacts = paginated_contact_query.all()
            return {
                'contacts': list(map(lambda x: x.json_for_list(), contacts)),
                'current_page': pagination_details.page_number,
                'total_pages': pagination_details.num_pages,
                'items_per_page': pagination_details.page_size,
                'total': pagination_details.total_results,
            }

    def apply_filter_and_search(self, args):
        #ToDo: modify this to fit the contact search/filter criteria rather than the mine search/filter
        # Todo: STEP ONE JUST SEARCH THE NAMES.


        # SEARCHES
        # first_name
        # party_name,
        #
        # FILTERS
        # associated mine Id,
        # phone,
        # email,
        # role,
        # person vs orginization


        # Handle ListView request
        items_per_page = args.get('per_page', 25, type=int)
        page = args.get('page', 1, type=int)


        #TODO: TALK TO TATIANNA AND ADRIENNE ABOUT ACTUAL SEARCH IMPLEMENTATION
        # # split the terms up and make an array of them
        # search_term = args.get('search', None, type=str)
        # # Filters to be applied
        # commodity_filter_terms = args.get('commodity', None, type=str)
        # status_filter_term = args.get('status', None, type=str)
        # tenure_filter_term = args.get('tenure', None, type=str)
        # region_code_filter_term = args.get('region', None, type=str)
        # major_mine_filter_term = args.get('major', None, type=str)
        # tsf_filter_term = args.get('tsf', None, type=str)
        # # Base query:
        # contact_query = Party.query
        # # Filter by search_term if provided
        # if search_term:
        #     # first_name and party_name (last name)
        #     name_search_terms = search_term.split()
        #     # search_term = search_term.strip()
        #     # FIX THIS
        #     first_name_filter = Party.first_name.ilike('%{}%'.format(name_search_terms))
        #     party_name_filter = Party.party_name.ilike('%{}%'.format(name_search_terms))
        #     name_query = Party.query.filter(first_name_filter | party_name_filter)
        #     contact_query = name_query.union(contact_query)

        first_name_filter_term = args.get('first_name', None, type=str)
        last_name_filter_term = args.get('last_name', None, type=str)
        party_name_filter_term = args.get('party_name', None, type=str)
        # mineid_filter_term = args.get()
        role_filter_term = args.get('role', None, type=str)


        conditions = []
        # contact_query = Party.query

        if first_name_filter_term:
            conditions.append( Party.first_name.ilike('%{}%'.format(first_name_filter_term)))
        if last_name_filter_term:
            conditions.append( Party.party_name.ilike('%{}%'.format(last_name_filter_term)))
        if party_name_filter_term:
            conditions.append(Party.party_name.ilike('%{}%'.format(party_name_filter_term)))

        # Filter by Mine ID, if provided
        # Filter by phone, if provided
        # Filter by email, if provided
        # Filter by role, if provided
        # Filter by  person vs orginization, if provided (bool search)

        # - Role
        # - Email
        # - Phone





        # if major_mine_filter_term == "true" or major_mine_filter_term == "false":
        #     major_mine_filter = Mine.major_mine_ind.is_(major_mine_filter_term == "true")
        #     major_mine_query = Mine.query.filter(major_mine_filter)
        #     mines_query = mines_query.intersect(major_mine_query)
        #
        # # Filter by region, if provided
        # if region_code_filter_term:
        #     region_filter_term_array = region_code_filter_term.split(',')
        #     region_filter = Mine.mine_region.in_(region_filter_term_array)
        #     region_query = Mine.query.filter(region_filter)
        #     mines_query = mines_query.intersect(region_query)

        # deleted_filter = [{'field': 'deleted_ind', 'op': '==', 'value': 'False'}]
        # mines_query = apply_filters(mines_query, deleted_filter)

        sort_criteria = [{'model': 'Party', 'field': 'party_name', 'direction': 'asc'}]
        contact_query = apply_sort(contact_query, sort_criteria)
        return apply_pagination(contact_query, page, items_per_page)
