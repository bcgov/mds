import uuid
from flask_restx import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_any_of, requires_role_edit_report, EDIT_REPORT, MINESPACE_PROPONENT, VIEW_ALL, is_minespace_user

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.mines.reports.models.mine_report_document_xref import MineReportDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import MineReportDefinitionComplianceArticleXref
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_REPORT_MODEL


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
    parser.add_argument('description_comment', type=str, location='json')
    parser.add_argument('submitter_name', type=str, location='json')
    parser.add_argument('submitter_email', type=str, location='json')
    parser.add_argument('mine_report_contacts', type=list, location='json')

    @api.marshal_with(MINE_REPORT_MODEL, envelope='records', code=200)
    @api.doc(description='returns the reports for a given mine.')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid):
        mrd_category = request.args.get('mine_report_definition_category')
        if mrd_category:
            return MineReport.find_by_mine_guid_and_category(mine_guid, mrd_category)

        reports_type = request.args.get('mine_reports_type', None)

        return MineReport.find_by_mine_guid_and_report_type(mine_guid, reports_type)

    @api.doc(description='creates a new report for the mine')
    @api.marshal_with(MINE_REPORT_MODEL, code=201)
    @requires_any_of([EDIT_REPORT, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        permit_condition_type_code = data.get('permit_condition_category_code', None)

        is_code_required_report = permit_condition_type_code == None
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
        elif is_first_submission and is_code_required_report:
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
            mine_report.send_report_update_email(False)

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
            mine_report.send_report_update_email(True)

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
