import pytest
import json
import uuid
import responses

from tests.status_code_gen import RandomIncidentDocumentType
from tests.factories import (InformationRequirementsTableFactory, MajorMineApplicationFactory, MineIncidentFactory, MineFactory, MineDocumentFactory, ProjectDecisionPackageFactory, ProjectFactory, ProjectSummaryDocumentFactory, ProjectSummaryFactory,
                             VarianceDocumentFactory, VarianceFactory)
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.services.document_manager_service import DocumentManagerService


@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory(
        minimal=True
    )

    document = MineDocumentFactory(mine=mine)

    yield dict(
        mine=mine,
        document=document
    )


class TestMineDocumentVersionUploadResource:
    """GET /mines/{mine_guid}/documents/{mine_document_guid}/versions/upload"""

    @responses.activate
    def test_create_returns_new_version(self, test_client, db_session, auth_headers, setup_info):
        """Should return new version info from docman successfully"""

        docman_version_guid = str(uuid.uuid4())
        docman_doc_guid = str(uuid.uuid4())

        mine = setup_info['mine']
        document = setup_info['document']

        ver_url = f'{DocumentManagerService.document_manager_document_resource_url}/{document.document_manager_guid}/versions'
        responses.add(responses.POST, ver_url, json={
            'document_manager_guid': docman_doc_guid,
            'document_manager_version_guid': docman_version_guid
        })

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions/upload',
            headers=auth_headers['full_auth_header']
        )

        assert post_resp.status_code == 200

        # The response is double-encoded. Manually make it into a valid json for test purposes
        post_data = json.loads(post_resp.data.decode("utf-8").replace("b'", "").replace("'", "\""))

        # post_data_dict = str_to_dict(post_data)
        assert isinstance(post_data, dict)

        assert post_data['document_manager_guid'] == docman_doc_guid
        assert post_data['document_manager_version_guid'] == docman_version_guid

    def test_create_missing_mine_returns_404(self, test_client, db_session, auth_headers, setup_info):
        """Returns 404 if mine doesn't exist"""

        mine = setup_info['mine']
        document = setup_info['document']

        post_resp = test_client.post(
            f'/mines/{uuid.uuid4()}/documents/{document.mine_document_guid}/versions/upload',
            headers=auth_headers['full_auth_header']
        )

        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 404
        assert 'Mine not found.' in post_data['message']

    def test_create_missing_mine_document_returns_404(self, test_client, db_session, auth_headers, setup_info):
        """Returns 404 if mine document doesn't exist"""

        mine = setup_info['mine']
        document = setup_info['document']

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{uuid.uuid4()}/versions/upload',
            headers=auth_headers['full_auth_header']
        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 404
        assert 'Mine document not found.' in post_data['message']

    def test_create_mine_document_not_attached_to_mine_returns_400(self, test_client, db_session, auth_headers, setup_info):
        """Returns 400 if mine document isn't attached to mine"""

        mine = setup_info['mine']
        document = MineDocumentFactory()

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions/upload',
            headers=auth_headers['full_auth_header']
        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400
        assert 'Mine document not attached to Mine' in post_data['message']

    def test_create_mine_document_archived_returns_400(self, test_client, db_session, auth_headers, setup_info):
        """Returns 400 if mine document isn't attached to mine"""

        mine = setup_info['mine']
        document = setup_info['document']
        document.is_archived = True
        document.save(commit=True)

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions/upload',
            headers=auth_headers['full_auth_header']
        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400
        assert 'Cannot create new version of archived document' in post_data['message']
