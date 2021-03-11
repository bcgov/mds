from flask_restplus import Resource, inputs
from flask import request, current_app
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest
from datetime import datetime

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.administrative_amendments.models.administrative_amendment_view import AdministrativeAmendmentView
from app.api.administrative_amendments.response_models import ADMINISTRATIVE_AMENDMENT_VIEW_LIST
from app.api.utils.access_decorators import requires_role_edit_permit, requires_any_of, VIEW_ALL, GIS
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class AdministrativeAmendmentListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('permit_guid', type=str, required=True)
    #required because only allowed on Major Mine Permit Amendment Application
    parser.add_argument('mine_guid', type=str, required=True)
    parser.add_argument('notice_of_work_type_code', type=str, required=True)
    parser.add_argument('submitted_date', type=str, required=True)
    parser.add_argument('received_date', type=str, required=True)
    parser.add_argument('import_timestamp_since', type=str)
    parser.add_argument('update_timestamp_since', type=str)

    @api.doc(
        description='Get a list of Core Notice of Work applications. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'application_status_description':
            'Comma-separated list of statuses to include in results. Default: All statuses.',
            'application_type_description': 'Substring to match with an application\'s type',
            'mine_region': 'Mine region code to match with an application. Default: All regions.',
            'administrative_amendment_number': 'Number of the administrative amendment application',
            'mine_search': 'Substring to match against an application mine number or mine name',
            'mine_guid': 'filter by a given mine guid',
            'import_timestamp_since': 'Filter by applications created since this date.',
            'update_timestamp_since': 'Filter by applications updated since this date.'
        })
    @requires_any_of([VIEW_ALL, GIS])
    @api.marshal_with(ADMINISTRATIVE_AMENDMENT_VIEW_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'received_date', type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            originating_system=request.args.getlist('originating_system', type=str),
            mine_guid=request.args.get('mine_guid', type=str),
            application_status_description=request.args.getlist(
                'application_status_description', type=str),
            application_type_description=request.args.getlist(
                'application_type_description', type=str),
            mine_region=request.args.getlist('mine_region', type=str),
            mine_name=request.args.get('mine_name', type=str),
            administrative_amendment_number=request.args.get(
                'administrative_amendment_number', type=str),
            mine_search=request.args.get('mine_search', type=str),
            lead_inspector_name=request.args.get('lead_inspector_name', type=str),
            import_timestamp_since=request.args.get(
                'import_timestamp_since',
                type=lambda x: inputs.datetime_from_iso8601(x) if x else None),
            update_timestamp_since=request.args.get(
                'update_timestamp_since',
                type=lambda x: inputs.datetime_from_iso8601(x) if x else None))

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
                                      application_status_description=[],
                                      mine_region=[],
                                      mine_name=None,
                                      administrative_amendment_number=None,
                                      mine_search=None,
                                      application_type_description=[],
                                      originating_system=[],
                                      submissions_only=None,
                                      import_timestamp_since=None,
                                      update_timestamp_since=None):

        filters = []
        base_query = AdministrativeAmendmentView.query

        if mine_guid:
            filters.append(AdministrativeAmendmentView.mine_guid == mine_guid)

        if lead_inspector_name:
            filters.append(
                func.lower(AdministrativeAmendmentView.lead_inspector_name).contains(
                    func.lower(lead_inspector_name)))

        if application_status_description:
            filters.append(
                AdministrativeAmendmentView.application_status_description.in_(
                    application_status_description))

        if administrative_amendment_number:
            filters.append(AdministrativeAmendmentView.administrative_amendment_number ==
                           administrative_amendment_number)

        if mine_region or mine_search or mine_name:
            base_query = base_query.join(Mine)

        if mine_region:
            filters.append(Mine.mine_region.in_(mine_region))

        if mine_name:
            filters.append(func.lower(Mine.mine_name).contains(func.lower(mine_name)))

        if mine_search:
            filters.append(
                or_(
                    func.lower(AdministrativeAmendmentView.mine_no).contains(
                        func.lower(mine_search)),
                    func.lower(Mine.mine_name).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_no).contains(func.lower(mine_search))))

        if application_type_description:
            filters.append(
                AdministrativeAmendmentView.application_type_description.in_(
                    application_type_description))

        if import_timestamp_since:
            filters.append(AdministrativeAmendmentView.import_timestamp >= import_timestamp_since)

        if update_timestamp_since:
            filters.append(AdministrativeAmendmentView.update_timestamp >= update_timestamp_since)

        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = None
            if sort_field in ['mine_region', 'mine_name']:
                sort_criteria = [{'model': 'Mine', 'field': sort_field, 'direction': sort_dir}]
            else:
                sort_criteria = [{
                    'model': 'AdministrativeAmendmentView',
                    'field': sort_field,
                    'direction': sort_dir,
                }]
            base_query = apply_sort(base_query, sort_criteria)

        return apply_pagination(base_query, page_number, page_size)