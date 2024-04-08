from flask import request
from flask_restx import Resource, inputs

from app.api.now_applications.resources.now_application_base_list_resource import NowApplicationBaseListResource
from app.api.now_applications.response_models import NOW_VIEW_LIST
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, GIS
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25
SORT_FIELD_DEFAULT = 'received_date'
SORT_DIR_DEFAULT = 'desc'


class NOWApplicationNOWNumbersListResource(NowApplicationBaseListResource):
    parser = CustomReqparser()
    parser.add_argument('now_numbers', type=list, location='json', required=False)

    @api.doc(description='Fetch NoW applications by list of now_numbers.', params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'sort_field': f'The field to sort on. Default: {SORT_FIELD_DEFAULT}',
            'sort_dir': f'The direction to sort on, accepts asc|desc. Default: {SORT_DIR_DEFAULT}',
            'now_application_status_description':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'notice_of_work_type_description': 'Substring to match with a NoW\'s type',
            'now_number': 'Number of the NoW',
            'mine_region': 'Mine region code to match with a NoW. Default: All regions.',
            'mine_name': 'Substring to match against a mine name',
            'mine_guid': 'filter by a given mine guid',
            'permit_no': 'filter by a given permit number',
            'party': 'filter by a given party name',
            'permit_guid': 'filter by a given permit guid',
            'mine_search': 'Substring to match against a NoW mine number or mine name',
            'submissions_only': 'Boolean to filter based on NROS/VFCBC/Core submissions only',
            'lead_inspector_name': 'Substring to match against a lead inspector\'s name',
            'issuing_inspector_name': 'Substring to match against an issuing inspector\'s name',
            'import_timestamp_since': 'Filter by applications created since this date.',
            'update_timestamp_since': 'Filter by applications updated since this date.',
            'application_type': 'Application type NOW or ADA.',
            'originating_system': 'System that the application was submitted through (ex: Core, MMS, VFCBC). Default: All systems',
        })
    @requires_any_of([VIEW_ALL, GIS])
    @api.marshal_with(NOW_VIEW_LIST, code=200)
    def post(self):
        now_numbers = self.parser.parse_args()['now_numbers']

        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', SORT_FIELD_DEFAULT, type=str),
            sort_dir=request.args.get('sort_dir', SORT_DIR_DEFAULT, type=str),
            originating_system=request.args.getlist('originating_system', type=str),
            mine_guid=request.args.get('mine_guid', type=str),
            now_application_status_description=request.args.getlist(
                'now_application_status_description', type=str),
            notice_of_work_type_description=request.args.getlist(
                'notice_of_work_type_description', type=str),
            mine_region=request.args.getlist('mine_region', type=str),
            mine_name=request.args.get('mine_name', type=str),
            now_number=request.args.get('now_number', type=str),
            mine_search=request.args.get('mine_search', type=str),
            lead_inspector_name=request.args.get('lead_inspector_name', type=str),
            issuing_inspector_name=request.args.get('issuing_inspector_name', type=str),
            submissions_only=request.args.get('submissions_only', type=str) in ['true', 'True'],
            import_timestamp_since=request.args.get(
                'import_timestamp_since',
                type=lambda x: inputs.datetime_from_iso8601(x) if x else None),
            update_timestamp_since=request.args.get(
                'update_timestamp_since',
                type=lambda x: inputs.datetime_from_iso8601(x) if x else None),
            application_type=request.args.get('application_type', type=str),
            permit_no=request.args.get('permit_no', type=str),
            party=request.args.get('party', type=str),
            now_numbers=now_numbers,
        )

        data = records.all()

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }