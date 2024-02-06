from flask_restx import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import func, or_


from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin 


PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class MineApplicationResource(Resource, UserMixin ):
    @api.doc(
        description='Get a list of NoW applications for a mine',
        params={
            'sort_field': 'Field to use for sorting. Default: receiveddate',
            'sort_dir': 'Sorting direction. Default: DESC',
            'status': 'Comma-separated list of statuses to include in results. Default: All statuses.',
            'noticeofworktype': 'Substring to match with a NoW type',
            'trackingnumber': 'Number of the NoW'
        })
    @requires_role_view_all
    @api.marshal_with(APPLICATION_LIST, code=200, envelope='records')
    def get(self, mine_guid):
        sort_field = request.args.get('sort_field', 'receiveddate', type=str)
        sort_dir=request.args.get('sort_dir', 'desc', type=str)

        filtered_query = self._apply_filters(
            mine_guid,
            status=request.args.get('status', type=str),
            noticeofworktype=request.args.get('noticeofworktype', type=str),
            trackingnumber=request.args.get('trackingnumber', type=int))

        if sort_field and sort_dir:
            sort_criteria = [{'model': 'Application', 'field': sort_field, 'direction': sort_dir}]
            filtered_query = apply_sort(filtered_query, sort_criteria)

        return filtered_query.all()


    def _apply_filters(self,
                       mine_guid,
                       sort_field=None,
                       sort_dir=None,
                       status=None,
                       noticeofworktype=None,
                       trackingnumber=None):
        filters = []
        base_query = Application.query.filter_by(mine_guid=mine_guid)

        if noticeofworktype is not None:
            filters.append(func.lower(Application.noticeofworktype).contains(func.lower(noticeofworktype)))
        if trackingnumber is not None:
            filters.append(Application.trackingnumber == trackingnumber)

        status_filter_values = []
        if status is not None:
            status_filter_values = status.split(',')

        if len(status_filter_values) > 0:
            status_filters = []
            for status in status_filter_values:
                status_filters.append(func.lower(Application.status).contains(func.lower(status)))
            filters.append(or_(*status_filters))

        return base_query.filter(*filters)
