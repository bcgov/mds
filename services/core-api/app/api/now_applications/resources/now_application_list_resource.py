from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.mines.region.models.region import MineRegionCode
from app.api.now_applications.models.notice_of_work_view import NoticeOfWorkView
from app.api.now_applications.response_models import NOW_VIEW_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class NoticeOfWorkListResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of Core now applications. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'status':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'notice_of_work_type_search': 'Substring to match with a NoW\s type',
            'mine_region': 'Mine region code to match with a NoW. Default: All regions.',
            'now_number': 'Number of the NoW',
            'mine_search': 'Substring to match against a NoW mine number or mine name',
            'submissions_only': 'Boolean to filter based on NROS/VFCBC submissions only',
        })
    @requires_role_view_all
    @api.marshal_with(NOW_VIEW_LIST, code=200)
    def get(self, mine_guid=None):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'received_date', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            mine_guid=mine_guid,
            status=request.args.get('status', type=str),
            notice_of_work_type_search=request.args.get('notice_of_work_type_search', type=str),
            mine_region=request.args.get('mine_region', type=str),
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
                                      status=None,
                                      notice_of_work_type_search=None,
                                      mine_region=None,
                                      now_number=None,
                                      mine_search=None,
                                      submissions_only=None):
        filters = []
        base_query = NoticeOfWorkView.query

        if submissions_only:
            filters.append(NoticeOfWorkView.originating_system != None)

        if mine_guid is not None:
            filters.append(NoticeOfWorkView.mine_guid == mine_guid)

        if lead_inspector_name is not None:
            filters.append(NoticeOfWorkView.lead_inspector_name == lead_inspector_name)

        if notice_of_work_type_search is not None:
            filters.append(
                func.lower(NoticeOfWorkView.notice_of_work_type_description).contains(
                    func.lower(notice_of_work_type_search)))
        if now_number is not None:
            filters.append(NoticeOfWorkView.now_number == now_number)

        if mine_region is not None or mine_search is not None:
            base_query = base_query.join(Mine)

        if mine_region is not None:
            region_filter_values = mine_region.split(',')
            filters.append(Mine.mine_region.in_(region_filter_values))

        if mine_search is not None:
            filters.append(
                or_(
                    func.lower(NoticeOfWorkView.mine_no).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_name).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_no).contains(func.lower(mine_search))))

        status_filter_values = []
        if status is not None:
            status_filter_values = status.split(',')

        if len(status_filter_values) > 0:
            status_filters = []
            for status in status_filter_values:
                status_filters.append(
                    func.lower(NoticeOfWorkView.now_application_status_description).contains(
                        func.lower(status)))
            filters.append(or_(*status_filters))

        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = [{
                'model': 'NoticeOfWorkView',
                'field': sort_field,
                'direction': sort_dir
            }]
            base_query = apply_sort(base_query, sort_criteria)

        return apply_pagination(base_query, page_number, page_size)
