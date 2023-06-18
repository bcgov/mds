import pytest
import json
import uuid

from tests.status_code_gen import RandomIncidentDocumentType
from tests.factories import (InformationRequirementsTableFactory, MineIncidentFactory, MineFactory, MineDocumentFactory, ProjectDecisionPackageFactory, ProjectFactory, ProjectSummaryDocumentFactory, ProjectSummaryFactory,
                             VarianceDocumentFactory, VarianceFactory)
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.mines.documents.models.mine_document import MineDocument


@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory(
        minimal=True
    )

    MineDocument.query.delete()

    yield dict(
        mine=mine
    )


class TestMineDocumentListResource:
    """GET /mines/{mine_guid}/documents"""

    def test_list_resource_no_documents(self, test_client, db_session, auth_headers, setup_info):
        """Should return no documents"""

        mine = setup_info['mine']

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/documents',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 0

    def test_list_resource_one_document(self, test_client, db_session, auth_headers, setup_info):
        """Should return no documents"""

        mine = setup_info['mine']

        VarianceFactory(mine=mine)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/documents',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 1

    def test_list_resource_scoped_by_mine(self, test_client, db_session, auth_headers, setup_info):
        """Should return no documents"""

        mine = setup_info['mine']

        MineIncidentFactory(mine=mine)
        VarianceFactory()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/documents',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 1

    def test_list_resource_filter_by_project_summary_guid(self, test_client, db_session, auth_headers, setup_info):
        """Should return no documents"""

        mine = setup_info['mine']

        ps = ProjectFactory(mine=mine).project_summary
        MineDocumentFactory(mine=mine)
        MineDocumentFactory(mine=mine)

        assert len(mine.mine_documents) == 3

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/documents?project_summary_guid={ps.project_summary_guid}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 1
        assert str(ps.documents[0].mine_document_guid) == get_data['records'][0]['mine_document_guid']

    # def test_archive_project_summary_document_excludes_it(self, test_client, db_session, auth_headers):
    #     """Archives document from project summary response"""
    #     project_summary = ProjectSummaryFactory()
    #     project_summary_document = project_summary.mine_documents[0]

    #     assert project_summary_document is not None

    #     document_count = len(project_summary.mine_documents)

    #     patch_resp = test_client.patch(
    #         f'/mines/{project_summary.project.mine_guid}/documents/archive',
    #         headers=auth_headers['full_auth_header'],
    #         json={"mine_document_guids": [str(project_summary_document.mine_document_guid)]}
    #     )
    #     assert project_summary_document.is_archived
    #     assert patch_resp.status_code == 204
    #     db_session.refresh(project_summary)

    #     # Make sure archived document is not part of project summary documents
    #     assert len(project_summary.mine_documents) == document_count - 1

    # def test_archive_ir_table_document_excludes_it(self, test_client, db_session, auth_headers):
    #     """Archives document from ir_table response"""
    #     ir_table = InformationRequirementsTableFactory()
    #     ir_table_document = ir_table.documents[0].mine_document

    #     document_count = len(ir_table.mine_documents)

    #     patch_resp = test_client.patch(
    #         f'/mines/{ir_table.project.mine_guid}/documents/archive',
    #         headers=auth_headers['full_auth_header'],
    #         json={"mine_document_guids": [str(ir_table_document.mine_document_guid)]}
    #     )
    #     assert ir_table_document.is_archived
    #     assert patch_resp.status_code == 204
    #     db_session.refresh(ir_table)

    #     # Make sure archived document is not part of project summary documents
    #     assert len(ir_table.mine_documents) == document_count - 1

    # def test_archive_project_decision_package_document_excludes_it(self, test_client, db_session, auth_headers):
    #     """Archives document from decision_package response"""

    #     project_decision_package = ProjectDecisionPackageFactory()
    #     project_decision_package_document = project_decision_package.documents[0].mine_document

    #     document_count = len(project_decision_package.mine_documents)

    #     patch_resp = test_client.patch(
    #         f'/mines/{project_decision_package.project.mine_guid}/documents/archive',
    #         headers=auth_headers['full_auth_header'],
    #         json={"mine_document_guids": [str(project_decision_package_document.mine_document_guid)]}
    #     )
    #     assert project_decision_package_document.is_archived
    #     assert patch_resp.status_code == 204
    #     db_session.refresh(project_decision_package)

    #     # Make sure archived document is not part of project summary documents
    #     assert len(project_decision_package.mine_documents) == document_count - 1
