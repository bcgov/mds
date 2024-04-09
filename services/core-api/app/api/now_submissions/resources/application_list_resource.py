import uuid
from flask_restx import Resource
from flask import request, current_app
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_
from marshmallow.exceptions import MarshmallowError
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.mines.region.models.region import MineRegionCode
from app.api.now_submissions.models.application import Application
from app.api.now_submissions.response_models import PAGINATED_APPLICATION_LIST, APPLICATION
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_submissions
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ApplicationListResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of applications. Order: receiveddate DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'status':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'noticeofworktype': 'Substring to match with a NoW\s type',
            'mine_region': 'Mine region code to match with a NoW. Default: All regions.',
            'trackingnumber': 'Number of the NoW',
            'mine_search': 'Substring to match against a NoW mine number or mine name'
        })
    @requires_role_view_all
    @api.marshal_with(PAGINATED_APPLICATION_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'receiveddate', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            status=request.args.get('status', type=str),
            noticeofworktype=request.args.get('noticeofworktype', type=str),
            mine_region=request.args.get('mine_region', type=str),
            trackingnumber=request.args.get('trackingnumber', type=int),
            mine_search=request.args.get('mine_search', type=str))

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
                                      status=None,
                                      noticeofworktype=None,
                                      mine_region=None,
                                      trackingnumber=None,
                                      mine_search=None):
        filters = []
        base_query = Application.query

        if noticeofworktype is not None:
            filters.append(
                func.lower(Application.noticeofworktype).contains(func.lower(noticeofworktype)))
        if trackingnumber is not None:
            filters.append(Application.trackingnumber == trackingnumber)

        if mine_region is not None or mine_search is not None:
            base_query = base_query.join(Mine)

        if mine_region is not None:
            region_filter_values = mine_region.split(',')
            filters.append(Mine.mine_region.in_(region_filter_values))

        if mine_search is not None:
            filters.append(
                or_(
                    func.lower(Application.minenumber).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_name).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_no).contains(func.lower(mine_search))))

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

        return apply_pagination(base_query, page_number, page_size)

    @api.doc(description='Save an application')
    @requires_role_edit_submissions
    @api.expect(APPLICATION)
    @api.marshal_with(APPLICATION, code=201)
    def post(self):
        current_app.logger.debug('Attempting to load application')
        current_app.logger.info("*****VFCBC Request Payload*****")
        current_app.logger.info(request.json)
        try:
            application = Application._schema().load(request.json)
        except MarshmallowError as e:
            raise BadRequest(e)

        if application.application_guid is not None:
            raise BadRequest(f'messageid: {application.messageid} already exists.')

        if application.applicant.clientid == application.submitter.clientid:
            application.submitter = application.applicant
        current_app.logger.debug('Attempting to load the mine')
        mine = Mine.find_by_mine_no(application.minenumber)

        if mine is None:
            raise BadRequest('Mine not found from the minenumber supplied.')

        application.mine = mine

        application.now_application_identity = NOWApplicationIdentity(
            mine=mine,
            mine_guid=mine.mine_guid,
            now_submission=application,
            now_number=NOWApplicationIdentity.create_now_number(mine))
        application.processed = 'Y'
        application.originating_system = 'VFCBC'
        current_app.logger.debug('Attempting to Save')
        application.save()

        return application
