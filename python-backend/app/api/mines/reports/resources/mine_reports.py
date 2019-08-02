import uuid
from flask_restplus import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_report

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.documents.reports.models.mine_report import MineReportDocumentXref
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import MineReportDefinitionComplianceArticleXref
from app.api.utils.custom_reqparser import CustomReqparser
from ...mine_api_models import MINE_REPORT_MODEL


class MineReportListResource(Resource, UserMixin):
    parser = CustomReqparser()

    # required
    parser.add_argument('submission_year', type=str, location='json', required=True)
    parser.add_argument('mine_report_definition_guid', type=str, location='json', required=True)
    parser.add_argument(
        'due_date',
        location='json',
        required=True,
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)

    parser.add_argument('permit_guid', type=str, location='json')
    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument('report_submissions', type=list, location='json', store_missing=False)

    @api.marshal_with(MINE_REPORT_MODEL, envelope='records', code=200)
    @api.doc(description='returns the reports for a given mine.')
    @requires_role_view_all
    def get(self, mine_guid):
        mine_reports = MineReport.find_by_mine_guid(mine_guid)
        return mine_reports

    @api.expect(MINE_REPORT_MODEL)
    @api.doc(description='creates a new report for the mine')
    @api.marshal_with(MINE_REPORT_MODEL, code=201)
    @requires_role_edit_report
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()

        mine_report_definition = MineReportDefinition.find_by_mine_report_definition_guid(
            data['mine_report_definition_guid'])
        permit = Permit.find_by_permit_guid_or_no(data['permit_guid'])
        if mine_report_definition is None:
            raise BadRequest('A report must be selected from the list.')

        if permit and permit.mine_guid != mine.mine_guid:
            raise BadRequest('The permit must be associated with the selected mine.')

        mine_report_guid = uuid.uuid4()
        mine_report = MineReport.create(
            mine_report_guid=mine_report_guid,
            mine_report_definition_id=mine_report_definition.mine_report_definition_id,
            mine_guid=mine.mine_guid,
            due_date=data['due_date'],
            received_date=data['received_date'],
            submission_year=data['submission_year'],
            permit_id=permit.permit_id if permit else None)

        submissions = data.get('report_submissions')
        if submissions is not None:
            report_submission_guid = uuid.uuid4()
            submission = submissions[0]
            if len(submission.documents) > 0:
                report_submission = MineReportSubmission(
                    mine_report_submission_guid=report_submission_guid,
                    mine_report_submission_status_code='MIA',
                    submission_date=datetime.now())
                for submission_doc in submission.documents:
                    mine_doc = MineDocument(
                        mine_guid=mine.mine_guid,
                        document_name=submission_doc['document_name'],
                        document_manager_guid=submission_doc['document_manager_guid'])

                    if not mine_doc:
                        raise BadRequest('Unable to register uploaded file as document')

                    mine_doc.save()

                    report_submission.documents.append(mine_doc)

                mine_report.mine_report_submissions.append(report_submission)

        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return mine_report, 201


class MineReportResource(Resource, UserMixin):
    parser = CustomReqparser()
    # required

    parser.add_argument('due_date', type=str, location='json', store_missing=False)
    parser.add_argument(
        'received_date',
        location='json',
        store_missing=False,
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument('report_submissions', type=list, location='json', store_missing=False)

    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_role_view_all
    def get(self, mine_guid, mine_report_guid):
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report:
            raise NotFound("Mine Report not found")
        return mine_report

    @api.expect(parser)
    @api.marshal_with(MINE_REPORT_MODEL, code=200)
    @requires_role_edit_report
    def put(self, mine_guid, mine_report_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        mine_report = MineReport.find_by_mine_report_guid(mine_report_guid)
        if not mine_report or str(mine_report.mine_guid) != mine_guid:
            raise NotFound("Mine Report not found")

        data = self.parser.parse_args()
        due_date = data.get('due_date')
        received_date = data.get('received_date')

        if due_date:
            mine_report.due_date = due_date

        if received_date:
            mine_report.received_date = received_date

        report_submissions = data.get('report_submissions')
        subission_iterator = iter(report_submissions)
        new_submission = next((x for x in subission_iterator if x.new_submission == True), None)
        if new_submission is not None:
            new_report_submission_guid = uuid.uuid4()
            new_report_submission = MineReportSubmission(
                mine_report_submission_guid=new_report_submission_guid,
                mine_report_submission_status_code='MIA',
                submission_date=datetime.now())

            # Copy the current list of documents for the report submission
            last_submission_docs = mine_report.mine_report_submissions[0].documents

            # Gets the difference between the set of documents in the new submission and the last submission
            new_docs = [
                x for x in new_submission.documents if not any(
                    str(doc.document_manager_guid) == x['document_manager_guid']
                    for doc in last_submission_docs)
            ]
            # Get the documents that were on the last submission but not part of the new submission
            removed_docs = [
                x for x in last_submission_docs
                if not any(doc['document_manager_guid'] == str(x.document_manager_guid)
                           for doc in new_submission.documents)
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

        try:
            mine_report.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')
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