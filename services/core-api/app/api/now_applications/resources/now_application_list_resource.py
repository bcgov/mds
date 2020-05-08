from flask_restplus import Resource
from flask import request
from datetime import datetime
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.region.models.region import MineRegionCode
from app.api.now_applications.models.notice_of_work_view import NoticeOfWorkView
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.response_models import NOW_VIEW_LIST, NOW_APPLICATION_MODEL
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api import utils

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class NOWApplicationListResource(Resource, UserMixin):
    parser = utils.custom_reqparser.CustomReqparser()
    parser.add_argument('permit_guid', type=str, required=True)
    #required because only allowed on Major Mine Permit Amendment Application
    parser.add_argument('mine_guid', type=str, required=True)
    parser.add_argument('notice_of_work_type_code', type=str, required=True)
    parser.add_argument('submitted_date', type=str, required=True)
    parser.add_argument('received_date', type=str, required=True)

    @api.doc(
        description='Get a list of Core now applications. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'now_application_status_description':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'notice_of_work_type_description': 'Substring to match with a NoW\'s type',
            'mine_region': 'Mine region code to match with a NoW. Default: All regions.',
            'now_number': 'Number of the NoW',
            'mine_search': 'Substring to match against a NoW mine number or mine name',
            'submissions_only': 'Boolean to filter based on NROS/VFCBC/Core submissions only',
            'mine_guid': 'filter by a given mine guid'
        })
    @requires_role_view_all
    @api.marshal_with(NOW_VIEW_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'received_date', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
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
            submissions_only=request.args.get('submissions_only', type=str) in ['true', 'True'])

        data = records.all()

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    def _apply_filters_and_pagination(self,
                                      page_number=PAGE_DEFAULT,
                                      page_size=PER_PAGE_DEFAULT,
                                      sort_field=None,
                                      sort_dir=None,
                                      mine_guid=None,
                                      lead_inspector_name=None,
                                      notice_of_work_type_description=[],
                                      mine_region=[],
                                      mine_name=None,
                                      now_number=None,
                                      mine_search=None,
                                      now_application_status_description=[],
                                      originating_system=[],
                                      submissions_only=None):
        filters = []
        base_query = NoticeOfWorkView.query

        if submissions_only:
            filters.append(
                and_(NoticeOfWorkView.originating_system != None,
                     NoticeOfWorkView.originating_system != 'MMS'))

        if mine_guid:
            filters.append(NoticeOfWorkView.mine_guid == mine_guid)

        if lead_inspector_name:
            filters.append(
                func.lower(NoticeOfWorkView.lead_inspector_name).contains(
                    func.lower(lead_inspector_name)))

        if notice_of_work_type_description:
            filters.append(
                NoticeOfWorkView.notice_of_work_type_description.in_(
                    notice_of_work_type_description))

        if now_number:
            filters.append(NoticeOfWorkView.now_number == now_number)

        if mine_region or mine_search or mine_name:
            base_query = base_query.join(Mine)

        if mine_region:
            filters.append(Mine.mine_region.in_(mine_region))

        if originating_system:
            filters.append(NoticeOfWorkView.originating_system.in_(originating_system))

        if mine_name:
            filters.append(func.lower(Mine.mine_name).contains(func.lower(mine_name)))

        if mine_search:
            filters.append(
                or_(
                    func.lower(NoticeOfWorkView.mine_no).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_name).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_no).contains(func.lower(mine_search))))

        if now_application_status_description:
            filters.append(
                NoticeOfWorkView.now_application_status_description.in_(
                    now_application_status_description))

        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = None
            if sort_field in ['mine_region', 'mine_name']:
                sort_criteria = [{'model': 'Mine', 'field': sort_field, 'direction': sort_dir}]
            else:
                sort_criteria = [{
                    'model': 'NoticeOfWorkView',
                    'field': sort_field,
                    'direction': sort_dir,
                }]
            base_query = apply_sort(base_query, sort_criteria)

        return apply_pagination(base_query, page_number, page_size)

    @api.doc(description='Adds a notice of work to a mine/permit.', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=201)
    def post(self):
        data = self.parser.parse_args()
        mine = Mine.find_by_mine_guid(data['mine_guid'])
        permit = Permit.find_by_permit_guid(data['permit_guid'])
        err_str = ''
        if not mine:
            err_str += 'Mine not Found. '
        if not permit:
            err_str += 'Permit not Found. '
        if mine and not mine.major_mine_ind:
            err_str += 'Permit Applications can only be created on mines where major_mine_ind=True'
        if err_str:
            raise BadRequest(err_str)
        new_now = NOWApplicationIdentity(mine_guid=data['mine_guid'], permit=permit)
        new_now.now_application = NOWApplication(
            notice_of_work_type_code=data['notice_of_work_type_code'],
            now_application_status_code='SUB',
            submitted_date=data['submitted_date'],
            received_date=data['received_date'])

        new_now.save()
        return new_now, 201