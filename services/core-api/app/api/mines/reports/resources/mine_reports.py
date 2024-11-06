import uuid
from flask_restx import Resource
from flask import request, current_app
from datetime import datetime

from sqlalchemy.orm import joinedload
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.constants import MINE_REPORT_TYPE
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.reports.report_helpers import ReportFilterHelper
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, requires_role_edit_report, EDIT_REPORT, MINESPACE_PROPONENT, VIEW_ALL, is_minespace_user
from app.api.activity.models.activity_notification import ActivityType
from app.api.activity.models.activity_notification import ActivityRecipients
from app.api.activity.utils import trigger_notification

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_document_xref import MineReportDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_REPORT_MODEL, PAGINATED_REPORT_LIST
from app.api.mines.exceptions.mine_exceptions import MineException

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
    parser.add_argument('mine_report_submissions', type=list, location='json')
    parser.add_argument('permit_condition_category_code', type=str, location='json')
    parser.add_argument('mine_report_status_code', type=str, location='json')
    parser.add_argument('description_comment', type=str, location='json')
    parser.add_argument('submitter_name', type=str, location='json')
    parser.add_argument('submitter_email', type=str, location='json')
    parser.add_argument('mine_report_contacts', type=list, location='json')

    @api.marshal_with(PAGINATED_REPORT_LIST, code=200)
    @api.doc(description='returns the reports for a given mine.',
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
        }

        mrd_category = request.args.get('mine_report_definition_category')
        if mrd_category:
            return MineReport.find_by_mine_guid_and_category(mine_guid, mrd_category)

        reports_type = request.args.get('mine_reports_type', None)

        query = MineReport.query.filter_by(mine_guid=mine_guid, deleted_ind=False).order_by(MineReport.due_date.asc())

        if reports_type == MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS']:
            query = query.filter(MineReport.permit_condition_category_code.isnot(None))
        elif reports_type == MINE_REPORT_TYPE['CODE REQUIRED REPORTS']:
            query = query.filter(MineReport.permit_condition_category_code.is_(None))
        elif reports_type == MINE_REPORT_TYPE['TAILINGS REPORTS']:
            query = query.join(MineReport.mine_report_definition).join(MineReportDefinition.categories).filter(
                MineReportCategory.mine_report_category == 'TSF'
            )

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
        is_report_request = data.get('mine_report_status_code', None) == "NON"

        is_code_required_report = permit_condition_type_code == None
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
            # Permit Required Reports check
            permit_condition_category = PermitConditionCategory.find_by_permit_condition_category_code(
                permit_condition_type_code)
            if permit_condition_category:
                permit_condition_category_code = permit_condition_category.condition_category_code
            else:
                raise BadRequest('A permit required report type must be selected from the list.')
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
            submitter_name=data['submitter_name'],
            submitter_email=data['submitter_email'])

        contacts = data.get('mine_report_contacts')
        if contacts:
            mine_report_contacts = MineReportContact.create_from_list(contacts, mine_report.mine_report_id)
            if mine_report_contacts:
                mine_report.mine_report_contacts = mine_report_contacts

        # TODO: remove following with CODE_REQUIRED_REPORTS feature flag (submissions, if submissions)
        submissions = data.get('mine_report_submissions')
        if submissions:
            submission = submissions[-1]
            if len(submission.get('documents')) > 0:
                submission_status = data.get('mine_report_submission_status') if data.get(
                    'mine_report_submission_status') else 'INI'
                report_submission = MineReportSubmission(
                    description_comment=mine_report.description_comment,
                    due_date=mine_report.due_date,
                    mine_guid=mine_report.mine_guid,
                    mine_report_definition_id=mine_report.mine_report_definition_id,
                    mine_report_id=mine_report.mine_report_id,
                    mine_report_submission_status_code=submission_status,
                    permit_condition_category_code=mine_report.permit_condition_category_code,
                    permit_id=mine_report.permit_id,
                    received_date=mine_report.received_date,
                    submission_year=mine_report.submission_year,
                    submitter_email=mine_report.submitter_email,
                    submitter_name=mine_report.submitter_name,
                    submission_date=datetime.utcnow())
                for submission_doc in submission.get('documents'):
                    mine_doc = MineDocument(
                        mine_guid=mine.mine_guid,
                        document_name=submission_doc['document_name'],
                        document_manager_guid=submission_doc['document_manager_guid'])

                    if not mine_doc:
                        raise BadRequest('Unable to register uploaded file as document')

                    mine_doc.save()

                    report_submission.documents.append(mine_doc)

                mine_report.mine_report_submissions.append(report_submission)
                # TODO: remove following with CODE_REQUIRED_REPORTS feature flag (submissions, if submissions)
        elif is_first_submission and is_code_required_report and not is_report_request:
            # If this is the initial report, create a submission with the status
            # of INI (Received)
            initial_submission = MineReportSubmission(
                description_comment=mine_report.description_comment,
                due_date=mine_report.due_date,
                mine_guid=mine_report.mine_guid,
                mine_report_definition_id=mine_report.mine_report_definition_id,
                mine_report_id=mine_report.mine_report_id,
                permit_condition_category_code=mine_report.permit_condition_category_code,
                permit_id=mine_report.permit_id,
                received_date=mine_report.received_date,
                submission_year=mine_report.submission_year,
                submitter_email=mine_report.submitter_email,
                submitter_name=mine_report.submitter_name,
                mine_report_submission_status_code='INI',
                submission_date=datetime.utcnow())

            mine_report.mine_report_submissions.append(initial_submission)
        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        if is_minespace_user():
            mine_report.send_crr_report_update_email(False)

        if is_report_request:
            report_name = mine_report_definition.report_name if is_code_required_report else permit_condition_category.description
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
    parser.add_argument('mine_report_submissions', type=list, location='json', store_missing=False)

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

        report_submissions = data.get('mine_report_submissions')
        submission_iterator = iter(report_submissions)
        new_submission = next(
            (x for x in submission_iterator if x.get('mine_report_submission_guid') is None), None)
        if new_submission is not None:
            new_report_submission = MineReportSubmission(
                description_comment=mine_report.description_comment,
                due_date=mine_report.due_date,
                mine_guid=mine_report.mine_guid,
                mine_report_definition_id=mine_report.mine_report_definition_id,
                mine_report_id=mine_report.mine_report_id,
                permit_condition_category_code=mine_report.permit_condition_category_code,
                permit_id=mine_report.permit_id,
                received_date=mine_report.received_date,
                submission_year=mine_report.submission_year,
                submitter_email=mine_report.submitter_email,
                submitter_name=mine_report.submitter_name,
                submission_date=datetime.now(),
                mine_report_submission_status_code=mine_report_submission_status)
            # Copy the current list of documents for the report submission
            last_submission_docs = mine_report.mine_report_submissions[-1].documents.copy() if len(
                mine_report.mine_report_submissions) > 0 else []

            # Gets the difference between the set of documents in the new submission and the last submission
            new_docs = [
                x for x in new_submission.get('documents') if not any(
                    str(doc.document_manager_guid) == x['document_manager_guid']
                    for doc in last_submission_docs)
            ]
            # Get the documents that were on the last submission but not part of the new submission
            removed_docs = [
                x for x in last_submission_docs
                if not any(doc['document_manager_guid'] == str(x.document_manager_guid)
                           for doc in new_submission.get('documents'))
            ]
            # Remove the deleted documents from the existing set.
            for doc in removed_docs:
                last_submission_docs.remove(doc)

            if len(last_submission_docs) > 0:
                new_report_submission.documents.extend(last_submission_docs)

            for doc in new_docs:
                mine_doc = MineDocument(
                    mine_guid=mine.mine_guid,
                    document_name=doc['document_name'],
                    document_manager_guid=doc['document_manager_guid'])

                if not mine_doc:
                    raise BadRequest('Unable to register uploaded file as document')

                mine_doc.save()

                new_report_submission.documents.append(mine_doc)

            mine_report.mine_report_submissions.append(new_report_submission)

        # if the status has changed, update the status of the last submission
        elif (len(mine_report.mine_report_submissions) >
              0) and mine_report_submission_status != mine_report.mine_report_submissions[
                  -1].mine_report_submission_status_code:
            mine_report.mine_report_submissions[
                -1].mine_report_submission_status_code = mine_report_submission_status

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
