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
    db_session.refresh(document)

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
        doc_url = f'{DocumentManagerService.document_manager_document_resource_url}/{document.document_manager_guid}'
        responses.add(responses.GET, doc_url, json={
            'file_display_name': 'replacement.pdf'
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

    @responses.activate
    def test_create_attributes_versions_to_their_uploaders(self, test_client, db_session, auth_headers, setup_info):
        """Each archived version keeps its own uploader and upload date across multiple replaces"""

        mine = setup_info['mine']
        document = setup_info['document']
        db_session.refresh(document)
        original_uploader = document.create_user
        original_upload_date = document.upload_date
        doc_url = f'{DocumentManagerService.document_manager_document_resource_url}/{document.document_manager_guid}'
        responses.add(responses.GET, doc_url, json={'file_display_name': 'replacement.pdf'})

        versions = []
        for _ in range(2):
            docman_version_guid = str(uuid.uuid4())
            responses.add(
                responses.GET,
                f'{doc_url}/versions/{docman_version_guid}',
                json={'file_display_name': 'test.pdf'})
            post_resp = test_client.post(
                f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions',
                headers=auth_headers['full_auth_header'],
                json={'document_manager_version_guid': docman_version_guid})
            assert post_resp.status_code == 200
            versions.append(json.loads(post_resp.data.decode()))
            if len(versions) == 1:
                db_session.refresh(document)
                first_replacer = document.create_user
                first_replace_upload_date = document.upload_date

        # the first archived file was uploaded by the original uploader on the original date
        assert versions[0]['create_user'] == original_uploader
        assert versions[0]['upload_date'] == str(original_upload_date)
        # the second archived file is the one the first replace uploaded
        assert versions[1]['create_user'] == first_replacer
        assert versions[1]['upload_date'] == str(first_replace_upload_date)

    @responses.activate
    def test_create_docman_failure_does_not_commit(self, test_client, db_session, auth_headers, setup_info):
        """A failed docman lookup does not create a version or change the document"""

        mine = setup_info['mine']
        document = setup_info['document']
        original_name = document.document_name
        docman_version_guid = str(uuid.uuid4())
        responses.add(
            responses.GET,
            f'{DocumentManagerService.document_manager_document_resource_url}/{document.document_manager_guid}/versions/{docman_version_guid}',
            status=404,
            json={'message': 'not found'})

        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/documents/{document.mine_document_guid}/versions',
            headers=auth_headers['full_auth_header'],
            json={'document_manager_version_guid': docman_version_guid})

        assert post_resp.status_code >= 400
        db_session.refresh(document)
        assert document.document_name == original_name
        assert len(document.versions) == 0

    def test_archive_does_not_change_create_user(self, db_session, setup_info):
        """Archiving a document does not overwrite who uploaded it"""

        document = setup_info['document']
        original_uploader = document.create_user

        MineDocument.mark_as_archived_many([document.mine_document_guid])
        db_session.refresh(document)

        assert document.is_archived
        assert document.create_user == original_uploader

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
        assert 'Mine not found.' in post_data['message']

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
        assert 'Mine document not found.' in post_data['message']

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
        assert 'Mine document not attached to Mine' in post_data['message']

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
        assert 'Cannot create new version of archived document' in post_data['message']
