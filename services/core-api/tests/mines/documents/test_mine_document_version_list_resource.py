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
    def test_create_saves_document_version_entry(self, test_client, db_session, auth_headers, setup_info):
        """Creates a new MineDocumentVersion entry with data from docman"""

        docman_version_guid = str(uuid.uuid4())
        docman_doc_guid = str(uuid.uuid4())

        mine = setup_info['mine']
        document = setup_info['document']
        ver_url = f'{DocumentManagerService.document_manager_document_resource_url}/{document.document_manager_guid}/versions/{docman_version_guid}'
        responses.add(responses.GET, ver_url, json={
            'file_display_name': 'test.pdf'
        })

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions',
            headers=auth_headers['full_auth_header'],
            json={
                'document_manager_version_guid': docman_version_guid
            }
        )

        assert post_resp.status_code == 200

        post_data = json.loads(post_resp.data.decode())

        assert post_data['mine_document_version_guid'] is not None
        assert post_data['mine_document_guid'] == str(document.mine_document_guid)
        assert post_data['document_manager_version_guid'] == docman_version_guid
        assert post_data['document_name'] == 'test.pdf'
        assert post_data['upload_date'] is not None

    def test_create_missing_mine_returns_404(self, test_client, db_session, auth_headers, setup_info):
        """Returns 404 if mine doesn't exist"""

        docman_version_guid = str(uuid.uuid4())
        document = setup_info['document']

        post_resp = test_client.post(
            f'/mines/{uuid.uuid4()}/documents/{document.mine_document_guid}/versions',
            headers=auth_headers['full_auth_header'],
            json={
                'document_manager_version_guid': docman_version_guid
            }
        )

        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 404
        assert post_data['message'] == '404 Not Found: Mine not found.'

    def test_create_missing_mine_document_returns_404(self, test_client, db_session, auth_headers, setup_info):
        """Returns 404 if mine document doesn't exist"""

        mine = setup_info['mine']
        docman_version_guid = str(uuid.uuid4())

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{uuid.uuid4()}/versions/upload',
            headers=auth_headers['full_auth_header'],
            json={
                'document_manager_version_guid': docman_version_guid
            }
        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 404
        assert post_data['message'] == '404 Not Found: Mine document not found.'

    def test_create_mine_document_not_attached_to_mine_returns_400(self, test_client, db_session, auth_headers, setup_info):
        """Returns 400 if mine document isn't attached to mine"""

        mine = setup_info['mine']
        document = MineDocumentFactory()
        docman_version_guid = str(uuid.uuid4())

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions',
            headers=auth_headers['full_auth_header'],
            json={
                'document_manager_version_guid': docman_version_guid
            }
        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400
        assert post_data['message'] == '400 Bad Request: Mine document not attached to Mine'

    def test_create_mine_document_archived_returns_400(self, test_client, db_session, auth_headers, setup_info):
        """Returns 400 if mine document isn't attached to mine"""

        mine = setup_info['mine']
        document = setup_info['document']
        document.is_archived = True
        document.save(commit=True)
        docman_version_guid = str(uuid.uuid4())

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions',
            headers=auth_headers['full_auth_header'],
            json={
                'document_manager_version_guid': docman_version_guid
            }

        )
        post_data = json.loads(post_resp.data.decode())

        assert post_resp.status_code == 400
        assert post_data['message'] == '400 Bad Request: Cannot create new version of archived document'
