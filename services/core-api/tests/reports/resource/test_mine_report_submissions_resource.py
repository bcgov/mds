import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.constants import MINE_REPORT_TYPE

from tests.factories import MineFactory, MineDocumentFactory, MineReportFactory, MineReportSubmissionFactory, PermitFactory, PermitAmendmentFactory, PartyFactory
THREE_REPORTS = 3
ONE_REPORT = 1
GUID = str(uuid.uuid4)

def test_post_additional_mine_report_submission(test_client, db_session, auth_headers):
    mine_report = MineReportFactory(mine_report_submissions=1)
    first_submission = mine_report.mine_report_submissions[0]

    num_submissions = len(mine_report.mine_report_submissions)

    # modify original submission
    submission_data = first_submission.json()

    # add a document
    new_document_data = MineDocumentFactory()
    new_document = {
        'document_name': new_document_data.document_name,
        'document_manager_guid': new_document_data.document_manager_guid
    }
    submission_data['documents'].append(new_document)

    # TODO add a mine report contact
    
    # change report definition
    mine_report_definition = MineReportDefinition.get_all()
    new_report_definition = [
        x for x in mine_report_definition
        if x.mine_report_definition_guid != first_submission.mine_report_definition_guid
    ][0]
    submission_data['mine_report_definition_guid'] = new_report_definition.mine_report_definition_guid

    # change status code
    mine_report_status_code = MineReportSubmissionStatusCode.get_all()
    new_status_code = [
        x for x in mine_report_status_code
        if x.mine_report_submission_status_code != first_submission.mine_report_submission_status_code
    ][0]
    submission_data['mine_report_submission_status_code'] = new_status_code.mine_report_submission_status_code
    
    submission_data['description_comment'] = "New description comment"

    post_resp = test_client.post(
        f'mines/reports/submissions', headers=auth_headers['full_auth_header'], json=submission_data)
    post_data = json.loads(post_resp.data.decode())

    updated_report = MineReport.find_by_mine_report_guid(str(mine_report.mine_report_guid))
    submissions = updated_report.mine_report_submissions

    assert post_resp.data == {}
    assert post_resp.status_code == 201
    assert len(submissions) == num_submissions + 1
    

    
