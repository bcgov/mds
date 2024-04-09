from flask import request
from flask_restx import Resource, inputs
from sqlalchemy import func, or_, and_
from sqlalchemy_filters import apply_pagination, apply_sort
from werkzeug.exceptions import BadRequest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.now_applications.models.applications_view import ApplicationsView
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.resources.now_application_base_list_resource import NowApplicationBaseListResource
from app.api.now_applications.response_models import NOW_VIEW_LIST, NOW_APPLICATION_MODEL
from app.api.utils.access_decorators import requires_role_edit_permit, requires_any_of, VIEW_ALL, GIS
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25
SORT_FIELD_DEFAULT = 'received_date'
SORT_DIR_DEFAULT = 'desc'


class NOWApplicationListResource(NowApplicationBaseListResource):
    parser = CustomReqparser()
    parser.add_argument('permit_guid', type=str, required=True)
    # required because only allowed on Major Mine Permit Amendment Application
    parser.add_argument('mine_guid', type=str, required=True)
    parser.add_argument('notice_of_work_type_code', type=str, required=True)
    parser.add_argument('submitted_date', type=str, required=True)
    parser.add_argument('received_date', type=str, required=True)
    parser.add_argument('import_timestamp_since', type=str)
    parser.add_argument('update_timestamp_since', type=str)
    parser.add_argument('application_type', type=str)

    @api.doc(
        description='Get a list of Core Notice of Work applications. Order: received_date DESC',
        params={
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
    def get(self):
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
        )

        data = records.all()

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @api.doc(description='Adds a Notice of Work to a mine/permit.', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=201)
    def post(self):
        data = self.parser.parse_args()
        mine = Mine.find_by_mine_guid(data['mine_guid'])
        permit = Permit.find_by_permit_guid(data['permit_guid'])
        err_str = ''
        if not mine:
            err_str += 'Mine not found. '
        if not permit:
            err_str += 'Permit not found. '
        if mine and not mine.major_mine_ind:
            err_str += 'Permit applications can only be created for major mines.'
        if err_str:
            raise BadRequest(err_str)
        new_now = NOWApplicationIdentity(mine_guid=data['mine_guid'], permit=permit)
        new_now.now_application = NOWApplication(
            notice_of_work_type_code=data['notice_of_work_type_code'],
            now_application_status_code='REC',
            submitted_date=data['submitted_date'],
            received_date=data['received_date'])
        new_now.originating_system = 'Core'
        new_now.save()
        return new_now, 201
