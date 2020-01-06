from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.mines.region.models.region import MineRegionCode
from app.api.now_applications.models.notice_of_work_view import NoticeOfWorkView
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.response_models import NOW_VIEW_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25
import sys


class NoticeOfWorkListResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of Core now applications. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'now_application_status_description':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'notice_of_work_type_description': 'Substring to match with a NoW\s type',
            'mine_region': 'Mine region code to match with a NoW. Default: All regions.',
            'now_number': 'Number of the NoW',
            'mine_search': 'Substring to match against a NoW mine number or mine name',
            'submissions_only': 'Boolean to filter based on NROS/VFCBC submissions only'
        })
    @requires_role_view_all
    @api.marshal_with(NOW_VIEW_LIST, code=200)
    def get(self, mine_guid=None):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'received_date', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            originating_system=request.args.get('originating_system', 'desc', type=str),
            mine_guid=mine_guid,
            now_application_status_description=request.args.getlist(
                'now_application_status_description', type=str),
            notice_of_work_type_description=request.args.getlist(
                'notice_of_work_type_description', type=str),
            mine_region=request.args.getlist('mine_region', type=str),
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
                                      now_number=None,
                                      mine_search=None,
                                      now_application_status_description=[],
                                      originating_system=None,
                                      submissions_only=None):
        filters = []
        base_query = NoticeOfWorkView.query

        if submissions_only:
            filters.append(NoticeOfWorkView.originating_system != None)

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

        if mine_region or mine_search:
            base_query = base_query.join(Mine)

        if mine_region:
            filters.append(Mine.mine_region.in_(mine_region))

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
