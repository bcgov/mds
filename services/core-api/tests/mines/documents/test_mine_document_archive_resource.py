import pytest
import json
import uuid

from tests.status_code_gen import RandomIncidentDocumentType
from tests.factories import (InformationRequirementsTableFactory, MineIncidentFactory, MineFactory, MineDocumentFactory, ProjectDecisionPackageFactory, ProjectSummaryDocumentFactory, ProjectSummaryFactory,
                             VarianceDocumentFactory)
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.mines.documents.models.mine_document import MineDocument


class TestArchiveMineDocument:
    """PATCH /mines/{mine_guid}/documents/archive"""

    def test_archive_document(self, test_client, db_session, auth_headers):
        """Should archive a document"""

        mine = MineFactory()
        mine_document = MineDocumentFactory(mine=mine)

        assert mine_document.is_archived is False

        patch_resp = test_client.patch(
            f'/mines/{mine.mine_guid}/documents/archive',
            headers=auth_headers['full_auth_header'],
            json={"mine_document_guids": [mine_document.mine_document_guid]}
        )

        assert patch_resp.status_code == 204

        document = MineDocument.find_by_mine_document_guid(mine_document.mine_document_guid)

        assert document.is_archived

    def test_archive_project_summary_document_excludes_it(self, test_client, db_session, auth_headers):
        """Archives document from project summary response"""
        project_summary = ProjectSummaryFactory()
        project_summary_document = project_summary.mine_documents[0]

        assert project_summary_document is not None

        document_count = len(project_summary.mine_documents)

        patch_resp = test_client.patch(
            f'/mines/{project_summary.project.mine_guid}/documents/archive',
            headers=auth_headers['full_auth_header'],
            json={"mine_document_guids": [str(project_summary_document.mine_document_guid)]}
        )
        assert project_summary_document.is_archived
        assert patch_resp.status_code == 204
        db_session.refresh(project_summary)

        # Make sure archived document is not part of project summary documents
        assert len(project_summary.mine_documents) == document_count - 1

    def test_archive_ir_table_document_excludes_it(self, test_client, db_session, auth_headers):
        """Archives document from ir_table response"""
        ir_table = InformationRequirementsTableFactory()
        ir_table_document = ir_table.documents[0].mine_document

        document_count = len(ir_table.mine_documents)

        patch_resp = test_client.patch(
            f'/mines/{ir_table.project.mine_guid}/documents/archive',
            headers=auth_headers['full_auth_header'],
            json={"mine_document_guids": [str(ir_table_document.mine_document_guid)]}
        )
        assert ir_table_document.is_archived
        assert patch_resp.status_code == 204
        db_session.refresh(ir_table)

        # Make sure archived document is not part of project summary documents
        assert len(ir_table.mine_documents) == document_count - 1


    def test_archive_project_decision_package_document_excludes_it(self, test_client, db_session, auth_headers):
        """Archives document from decision_package response"""

        project_decision_package = ProjectDecisionPackageFactory()
        project_decision_package_document = project_decision_package.documents[0].mine_document

        document_count = len(project_decision_package.mine_documents)

        patch_resp = test_client.patch(
            f'/mines/{project_decision_package.project.mine_guid}/documents/archive',
            headers=auth_headers['full_auth_header'],
            json={"mine_document_guids": [str(project_decision_package_document.mine_document_guid)]}
        )
        assert project_decision_package_document.is_archived
        assert patch_resp.status_code == 204
        db_session.refresh(project_decision_package)

        # Make sure archived document is not part of project summary documents
        assert len(project_decision_package.mine_documents) == document_count - 1
