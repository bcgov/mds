from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination
from sqlalchemy import desc, func, or_


from app.extensions import api
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import PAGINATED_APPLICATION_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ApplicationListResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of applications. Order: receiveddate DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'status': 'Comma-separated list of statuses to include in results. Default: All statuses.',
            'noticeofworktype': 'Substring to match with a NoW\s type',
            'region': 'Substring to match with a NoW region',
            'trackingnumber': 'Number of the NoW',
            'minenumber': 'Number of the mine associated with the NoW'
        })
    @requires_role_view_all
    @api.marshal_with(PAGINATED_APPLICATION_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            status=request.args.get('status', type=str),
            noticeofworktype=request.args.get('noticeofworktype', type=str),
            region=request.args.get('region', type=str),
            trackingnumber=request.args.get('trackingnumber', type=int),
            minenumber=request.args.get('minenumber', type=str))

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
                                      status=None,
                                      noticeofworktype=None,
                                      region=None,
                                      trackingnumber=None,
                                      minenumber=None):
        filters = []

        if noticeofworktype is not None:
            filters.append(func.lower(Application.noticeofworktype).contains(func.lower(noticeofworktype)))
        if region is not None:
            filters.append(func.lower(Application.region).contains(func.lower(region)))
        if trackingnumber is not None:
            filters.append(Application.trackingnumber == trackingnumber)
        if minenumber is not None:
            filters.append(func.lower(Application.minenumber).contains(func.lower(minenumber)))

        status_filter_values = []
        if status is not None:
            status_filter_values = status.split(',')

        if len(status_filter_values) > 0:
            status_filters = []
            for status in status_filter_values:
                status_filters.append(func.lower(Application.status).contains(func.lower(status)))
            filters.append(or_(*status_filters))

        filtered_query = Application.query.order_by(desc(Application.receiveddate)) \
                .filter(*filters)

        return apply_pagination(filtered_query, page_number, page_size)
