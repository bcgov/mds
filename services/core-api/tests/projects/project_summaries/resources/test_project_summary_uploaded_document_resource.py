import pytest
import json
import uuid

from tests.factories import (ProjectSummaryFactory, MineFactory, MineDocumentFactory,
                             ProjectSummaryDocumentFactory)


# DELETE
def test_delete_file(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()
    project_summary_document = project_summary.documents[0]
    document_count = len(project_summary.documents)
    assert project_summary_document is not None

    delete_resp = test_client.delete(
        f'/projects/{project_summary.project_guid}/project-summaries/{project_summary.project_summary_guid}/documents/{project_summary_document.mine_document_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204
    assert len(project_summary.documents) == document_count - 1


def test_delete_file_not_on_project_summary(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()
    mine_document_guid = MineDocumentFactory().mine_document_guid

    delete_resp = test_client.delete(
        f'/projects/{project_summary.project_guid}/project-summaries/{project_summary.project_summary_guid}/documents/{mine_document_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404
