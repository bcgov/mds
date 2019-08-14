from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination
from sqlalchemy import desc


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
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}'
        })
    @requires_role_view_all
    @api.marshal_with(PAGINATED_APPLICATION_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int))

        data = records.all()

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @staticmethod
    def _apply_filters_and_pagination(page_number=PAGE_DEFAULT, page_size=PER_PAGE_DEFAULT):
        filtered_query = Application.query.order_by(desc(Application.receiveddate))

        return apply_pagination(filtered_query, page_number, page_size)
