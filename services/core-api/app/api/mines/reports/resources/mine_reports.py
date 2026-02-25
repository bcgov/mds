import uuid
from datetime import datetime, date, timedelta

from app.api.activity.models.activity_notification import (
    ActivityRecipients,
    ActivityType,
)
from app.api.activity.utils import trigger_notification
from app.api.constants import MINE_REPORT_TYPE
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.exceptions.mine_exceptions import MineException
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_document_xref import (
    MineReportDocumentXref,
)
from app.api.mines.reports.models.mine_report_permit_requirement import (
    MineReportPermitRequirement,
)
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.report_helpers import ReportFilterHelper
from app.api.mines.response_models import MINE_REPORT_MODEL, PAGINATED_REPORT_LIST
from app.api.utils.access_decorators import (
    EDIT_REPORT,
    MINESPACE_PROPONENT,
    VIEW_ALL,
    is_minespace_user,
    requires_any_of,
    requires_role_edit_report,
)
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app, request
from flask_restx import Resource
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 10

class MineReportListResource(Resource, UserMixin):
    parser = CustomReqparser()

    # required
    parser.add_argument('submission_year', type=str, location='json', required=True)
    parser.add_argument('mine_report_definition_guid', type=str, location='json')
    parser.add_argument(
        'due_date', location='json', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)

    parser.add_argument('permit_guid', type=str, location='json')
    parser.add_argument('mine_report_submission_status', type=str, location='json')
    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument('permit_condition_category_code', type=str, location='json')
    parser.add_argument('mine_report_permit_requirement_id', type=int, location='json')
    parser.add_argument('mine_report_status_code', type=str, location='json')
    parser.add_argument('description_comment', type=str, location='json')
    parser.add_argument('submitter_name', type=str, location='json')
    parser.add_argument('submitter_email', type=str, location='json')
    parser.add_argument('mine_report_contacts', type=list, location='json')

    @api.marshal_with(PAGINATED_REPORT_LIST, code=200)
    @api.doc(description='returns the reports for a given mine (supports upcoming filter).',
    params={
        'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
        'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
        'sort_field': 'The field the returned results will be ordered by',
        'sort_dir': 'The direction by which the sort field is ordered',
        'search': 'A substring to match in a mine name, mine number, or permit number',
        'report_type': 'The report categories',
        'report_name': 'The descriptive names of the report',
        'due_date_after': 'Reports with a due date only after this date',
        'due_date_before': 'Reports with a due date only before this date',
        'received_date_after': 'Reports with a received date only after this date',
        'received_date_before': 'Reports with a received date only before this date',
        'received_only': 'Whether or not to only show reports that have a set received date',
        'compliance_year': 'The compliance year/period of the report',
        'requested_by': 'A substring to match in the name of the user who requested the report',
        'major': 'Whether or not the report is for a major or regional mine',
        'region': 'Regions the mines associated with the report are located in',
        'mine_reports_type': "Report type filter(s). Can repeat to include multiple.",
        'upcoming': "If 'true', restrict to upcoming reports (due after today) and apply 'time_range' window.",
        'time_range': "Upcoming window from today when 'upcoming' is true: one of '90d', '6m', '1y'. Default: '1y'",
        'permit_guid': "The permit number",
    })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
            'search_terms': request.args.get('search', type=str),
            'report_type': request.args.getlist('report_type', type=str),
            'report_name': request.args.getlist('report_name', type=str),
            'due_date_after': request.args.get('due_date_start', type=str),
            'due_date_before': request.args.get('due_date_end', type=str),
            'received_date_after': request.args.get('received_date_start', type=str),
            'received_date_before': request.args.get('received_date_end', type=str),
            'received_only': request.args.get('received_only', type=str) == "true",
            'compliance_year': request.args.get('compliance_year', type=str),
            'requested_by': request.args.get('requested_by', type=str),
            'status': request.args.getlist('status', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.getlist('region', type=str),
            'permit_guid': request.args.get('permit_guid', type=str),
        }

        mrd_category = request.args.get('mine_report_definition_category')

        if mrd_category:
            return MineReport.find_by_mine_guid_and_category(mine_guid, mrd_category)

        # Support multiple report types via repeated mine_reports_type query params
        requested_types = set(request.args.getlist('mine_reports_type', type=str) or [])

        if not args['sort_field']:
            args['sort_field'] = 'due_date'
        if not args['sort_dir']:
            args['sort_dir'] = 'asc'

        # Optional "upcoming" mode mirrors MineUpcomingReportListResource behavior
        upcoming = (request.args.get('upcoming', type=str) or '').lower() == 'true'
        if upcoming:
            # time_range: one of '90d', '6m', '1y' (default '1y')
            time_range = request.args.get('time_range', '1y', type=str)
            if time_range not in {'90d', '6m', '1y'}:
                time_range = '90d'

            if time_range == '90d':
                end_date = date.today() + timedelta(days=90)
            elif time_range == '6m':
                end_date = date.today() + timedelta(days=182)
            else:
                end_date = date.today() + timedelta(days=365)

            # Enforce due date to be strictly in the future within the window, unless caller already set
            if not args['due_date_after']:
                args['due_date_after'] = date.today().isoformat()
            if not args['due_date_before']:
                args['due_date_before'] = end_date.isoformat()

            # If no explicit report types provided, default to CRR + PRR for upcoming
            if not requested_types:
                requested_types = {
                    MINE_REPORT_TYPE['CODE REQUIRED REPORTS'],
                    MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS'],
                }

        # Base query; ordering is applied via ReportFilterHelper
        query = (
            MineReport.query
            .outerjoin(MineReportDefinition)
            .filter(
                MineReport.mine_guid == mine_guid,
                MineReport.deleted_ind == False,
                or_(
                    MineReport.mine_report_definition_id.is_(None),
                    MineReportDefinition.active_ind.is_(True),
                )
            )
        )
        
        if requested_types:
            conditions = []

            # PRR: No definition id
            if MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS'] in requested_types:
                conditions.append(MineReport.mine_report_definition_id.is_(None))

            # CRR: Has definition id; optionally exclude TSF unless TAR explicitly requested
            if MINE_REPORT_TYPE['CODE REQUIRED REPORTS'] in requested_types:
                crr_cond = MineReport.mine_report_definition_id.isnot(None)
                # if MINE_REPORT_TYPE['TAILINGS REPORTS'] not in requested_types:
                #     crr_cond = crr_cond & (~MineReport.mine_report_definition.has(
                #         MineReportDefinition.categories.any(
                #             MineReportCategory.mine_report_category == 'TSF'
                #         )
                #     ))
                conditions.append(crr_cond)

            # TAR: TSF category on definition
            if MINE_REPORT_TYPE['TAILINGS REPORTS'] in requested_types:
                tar_cond = MineReport.mine_report_definition.has(
                    MineReportDefinition.categories.any(
                        MineReportCategory.mine_report_category == 'TSF'
                    )
                )
                conditions.append(tar_cond)

            if conditions:
                query = query.filter(or_(*conditions))

        records, pagination_details = ReportFilterHelper.apply_filters_and_pagination(query, args, mine_guid)

        if not records:
            raise BadRequest('Unable to fetch reports')
        
        return {
            'records': records.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @api.doc(description='creates a new report for the mine')
    @api.marshal_with(MINE_REPORT_MODEL, code=201)
    @requires_any_of([EDIT_REPORT, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        permit_condition_type_code = data.get('permit_condition_category_code', None)
        mine_report_permit_requirement_id = data.get('mine_report_permit_requirement_id', None)
        is_report_request = data.get('mine_report_status_code', None) == "NON"

        is_legacy_prr = permit_condition_type_code is not None
        is_new_prr = mine_report_permit_requirement_id is not None
        is_code_required_report = not is_legacy_prr and not is_new_prr
        permit_condition_category = None
        permit_condition_category_code = None
        permit_guid = data['permit_guid']

        is_first_submission = False
        mine_report_guid = data.get('mine_report_guid', None)

        if not mine_report_guid:
            is_first_submission = True

        # Code Required Reports check
        if is_code_required_report:
            mine_report_definition = MineReportDefinition.find_by_mine_report_definition_guid(
                data['mine_report_definition_guid'])
            if mine_report_definition is None:
                raise BadRequest('A code required report type must be selected from the list.')
        else:
            if is_legacy_prr:
                # Permit Required Reports check
                permit_condition_category = PermitConditionCategory.find_by_permit_condition_category_code(
                    permit_condition_type_code)
                if permit_condition_category:
                    permit_condition_category_code = permit_condition_category.condition_category_code
                else:
                    raise BadRequest('A permit required report type must be selected from the list.')
            else:
                permit_requirement = MineReportPermitRequirement.find_by_mine_report_permit_requirement_id(mine_report_permit_requirement_id)
                if not permit_requirement:
                    raise BadRequest('Mine report permit requirement is required')
                if permit_requirement.permit_condition_ids is None or len(permit_requirement.permit_condition_ids) == 0:
                    raise BadRequest('Mine report permit requirement must have at least one permit condition associated with it.')
            if not permit_guid:
                raise BadRequest('A permit must be selected for Permit Required Report')

        permit = Permit.find_by_permit_guid_or_no(permit_guid)

        if permit:
            permit._context_mine = mine
            if permit.mine.mine_guid != mine.mine_guid:
                raise BadRequest('The permit must be associated with the selected mine.')

        mine_report = MineReport.create(
            mine_report_definition_id=mine_report_definition.mine_report_definition_id
            if is_code_required_report else None,
            mine_guid=mine.mine_guid,
            due_date=data.get('due_date'),
            received_date=data['received_date'],
            submission_year=data['submission_year'],
            description_comment=data['description_comment'],
            permit_id=permit.permit_id if permit else None,
            permit_condition_category_code=permit_condition_category_code,
            mine_report_permit_requirement_id=mine_report_permit_requirement_id,
            submitter_name=data['submitter_name'],
            submitter_email=data['submitter_email'])

        contacts = data.get('mine_report_contacts')
        if contacts:
            mine_report_contacts = MineReportContact.create_from_list(contacts, mine_report.mine_report_id)
            if mine_report_contacts:
                mine_report.mine_report_contacts = mine_report_contacts

        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        if is_minespace_user():
            mine_report.send_crr_report_update_email(False)

        if is_report_request:
            report_name = mine_report.report_name
            trigger_notification(f'A report has been requested by the ministry: {report_name}', ActivityType.report_requested, mine, 'MineReport', mine_report.mine_report_guid, None, None, ActivityRecipients.minespace_users)
            try:
                mine_report.send_report_requested_email(report_name, is_code_required_report)
            except Exception as e:
                current_app.logger.warning(f"Couldn't send the email notification for the requested report: {report_name}. {str(e)}")

        return mine_report, 201


class MineReportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('due_date', type=str, location='json', store_missing=False)
    parser.add_argument(
        'received_date',
        location='json',
        store_missing=False,
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument('submission_year', type=str, location='json', store_missing=False)
    parser.add_argument('mine_report_submission_status', type=str, location='json')

    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid, mine_report_guid):
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report:
            raise NotFound("Mine Report not found")
        return mine_report

    @api.expect(parser)
    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_any_of([EDIT_REPORT, MINESPACE_PROPONENT])
    def put(self, mine_guid, mine_report_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report or str(mine_report.mine_guid) != mine_guid:
            raise NotFound("Mine Report not found")

        data = self.parser.parse_args()

        if 'due_date' in data:
            mine_report.due_date = data.get('due_date')

        if 'received_date' in data:
            mine_report.received_date = data['received_date']

        if 'submission_year' in data:
            mine_report.submission_year = data['submission_year']

        if data.get('mine_report_submission_status') is not None:
            mine_report_submission_status = data.get('mine_report_submission_status')
        else:
            mine_report_submission_status = 'NRQ'


        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        if is_minespace_user():
            mine_report.send_crr_report_update_email(True)

        return mine_report

    @requires_role_edit_report
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, mine_report_guid):
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report or str(mine_report.mine_guid) != mine_guid:
            raise NotFound("Mine Report not found")

        mine_report.deleted_ind = True
        mine_report.save()
        return None, 204
