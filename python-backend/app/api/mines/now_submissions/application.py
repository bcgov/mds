from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import func, or_


from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import APPLICATION_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class MineApplicationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of NoW applications for a mine',
        params={
            'sort_field': 'Field to use for sorting. Default: receiveddate',
            'sort_dir': 'Sorting direction. Default: DESC',
            'status': 'Comma-separated list of statuses to include in results. Default: All statuses.',
            'noticeofworktype': 'Substring to match with a NoW\s type',
            'region': 'Substring to match with a NoW region',
            'trackingnumber': 'Number of the NoW'
        })
    @requires_role_view_all
    @api.marshal_with(APPLICATION_LIST, code=200, envelope='records')
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            sort_field = request.args.get('sort_field', 'receiveddate', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            status=request.args.get('status', type=str),
            noticeofworktype=request.args.get('noticeofworktype', type=str),
            region=request.args.get('region', type=str),
            trackingnumber=request.args.get('trackingnumber', type=int),

        return records.all()

    def _apply_filters_and_sorting(self,
                                   sort_field=None,
                                   sort_dir=None,
                                   status=None,
                                   noticeofworktype=None,
                                   region=None,
                                   trackingnumber=None):
        filters = []
        base_query = Application.query

        if noticeofworktype is not None:
            filters.append(func.lower(Application.noticeofworktype).contains(func.lower(noticeofworktype)))
        if region is not None:
            filters.append(func.lower(Application.region).contains(func.lower(region)))
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

        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = [{'model': 'Application', 'field': sort_field, 'direction': sort_dir}]
            base_query = apply_sort(base_query, sort_criteria)

        return base_query.all()
