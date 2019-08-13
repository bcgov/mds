from flask_restplus import Resource
from werkzeug.exceptions import NotFound, BadRequest
from flask import request
from sqlalchemy_filters import apply_pagination, apply_filters
from sqlalchemy import desc


from app.extensions import api
from app.api.mines.permits.permit.models.permit import Permit
from app.api.now_submissions.now_submission.models.application import Application
from app.api.now_submissions.response_models import APPLICATION, PAGINATED_APPLICATION_LIST
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ApplicationResource(Resource, UserMixin, ErrorMixin):
    @api.doc(description='Fetch an application by guid', params={})
    @requires_role_view_all
    @api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid):
        application = Application.find_by_application_guid(application_guid)
        if not application:
            raise NotFound('Application not found')

        return application


class ApplicationListResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of applications. Order: receiveddate DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'stuff': 'Comma-separated list of now submission applications to include in results.'
        })
    @requires_role_view_all
    @api.marshal_with(PAGINATED_APPLICATION_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int))

        if not records:
            raise BadRequest('Unable to fetch applications.')

        data = records.all()
        print(data[0].__dict__)

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    def _apply_filters_and_pagination(self,
                                        page_number=PAGE_DEFAULT,
                                        page_size=PER_PAGE_DEFAULT):

        filtered_query = Application.query.order_by(desc(Application.receiveddate))

        return apply_pagination(filtered_query, page_number, page_size)
