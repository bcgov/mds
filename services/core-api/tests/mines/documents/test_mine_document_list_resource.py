import pytest
import json
import uuid

from tests.status_code_gen import RandomIncidentDocumentType
from tests.factories import (InformationRequirementsTableFactory, MajorMineApplicationFactory, MineIncidentFactory, MineFactory, MineDocumentFactory, ProjectDecisionPackageFactory, ProjectFactory, ProjectSummaryDocumentFactory, ProjectSummaryFactory,
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

    def test_list_resource_filter_by_project_decision_package_guid(self, test_client, db_session, auth_headers, setup_info):
        """Should return no documents"""

        mine = setup_info['mine']

        proj = ProjectFactory(mine=mine)
        ps = ProjectDecisionPackageFactory(project=proj)
        MineDocumentFactory(mine=mine)
        MineDocumentFactory(mine=mine)

        assert len(mine.mine_documents) == 4

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/documents?project_decision_package_guid={ps.project_decision_package_guid}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == 1
        assert str(ps.documents[0].mine_document_guid) == get_data['records'][0]['mine_document_guid']
