import pytest

from app.api.mines.documents.models.spatial_bundle_purpose_code import SpatialBundlePurposeCode
from tests.factories import MineDocumentBundleFactory, MineDocumentFactory, MineFactory


@pytest.fixture
def mine_boundary_purpose(db_session):
    purpose = SpatialBundlePurposeCode.find_by_code('MBD')
    if not purpose:
        purpose = SpatialBundlePurposeCode(
            spatial_bundle_purpose_code='MBD',
            description='Mine Boundary',
            display_order=10,
            active_ind=True,
        )
        purpose.save()
    return purpose


class TestMineDocumentBundle():
    """Tests for GET/PATCH /mines/<mine_guid>/document-bundle"""

    def test_get_mine_document_bundle(self, test_client, db_session, auth_headers):
        mine_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()
        mine_doc.mine_document_bundle_id = document_bundle.bundle_id
        mine_doc.save()

        get_resp = test_client.get(
            f'/mines/{mine_doc.mine_guid}/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        data = get_resp.json
        assert data['bundle_id'] == document_bundle.bundle_id
        assert 'purpose_codes' in data
        assert 'validation_status' in data

    def test_get_mine_document_bundle_invalid_id(self, test_client, db_session, auth_headers):
        mine = MineFactory()
        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/document-bundle/invalid_id',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 400

    def test_get_rejects_bundle_without_active_documents(self, test_client, db_session,
                                                         auth_headers):
        mine = MineFactory()
        document_bundle = MineDocumentBundleFactory()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 400

    def test_get_rejects_documents_from_another_mine(self, test_client, db_session, auth_headers):
        mine = MineFactory()
        other_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()
        other_doc.mine_document_bundle_id = document_bundle.bundle_id
        other_doc.save()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 400

    def test_patch_purpose_codes(self, test_client, db_session, auth_headers):
        from app.api.mines.documents.models.spatial_bundle_purpose_code import SpatialBundlePurposeCode

        if not SpatialBundlePurposeCode.find_by_code('MBD'):
            SpatialBundlePurposeCode(
                spatial_bundle_purpose_code='MBD',
                description='Mine Boundary',
                display_order=10,
                active_ind=True,
            ).save()

        mine_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()
        mine_doc.mine_document_bundle_id = document_bundle.bundle_id
        mine_doc.save()

        patch_resp = test_client.patch(
            f'/mines/{mine_doc.mine_guid}/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header'],
            json={'purpose_codes': ['MBD']},
        )
        assert patch_resp.status_code == 200
        assert 'MBD' in patch_resp.json['purpose_codes']

    def test_patch_rejects_null_purpose_codes(self, test_client, db_session, auth_headers):
        mine_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()
        mine_doc.mine_document_bundle_id = document_bundle.bundle_id
        mine_doc.save()

        patch_resp = test_client.patch(
            f'/mines/{mine_doc.mine_guid}/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header'],
            json={'purpose_codes': None},
        )

        assert patch_resp.status_code == 400

    def test_patch_empty_purpose_codes_clears_existing(self, test_client, db_session, auth_headers,
                                                       mine_boundary_purpose):
        mine_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()
        mine_doc.mine_document_bundle_id = document_bundle.bundle_id
        mine_doc.save()
        url = f'/mines/{mine_doc.mine_guid}/document-bundle/{document_bundle.bundle_id}'

        assign_resp = test_client.patch(
            url,
            headers=auth_headers['full_auth_header'],
            json={'purpose_codes': ['MBD']},
        )

        assert assign_resp.status_code == 200
        assert assign_resp.json['purpose_codes'] == ['MBD']

        clear_resp = test_client.patch(
            url,
            headers=auth_headers['full_auth_header'],
            json={'purpose_codes': []},
        )

        assert clear_resp.status_code == 200
        assert clear_resp.json['purpose_codes'] == []

        get_resp = test_client.get(url, headers=auth_headers['full_auth_header'])
        assert get_resp.json['purpose_codes'] == []

    def test_post_creates_bundle(self, test_client, db_session, auth_headers):
        import uuid

        mine_doc = MineDocumentFactory()
        post_resp = test_client.post(
            f'/mines/{mine_doc.mine_guid}/document-bundle',
            headers=auth_headers['full_auth_header'],
            json={
                'name': 'boundary',
                'docman_bundle_guid': str(uuid.uuid4()),
                'document_manager_guids': [str(mine_doc.document_manager_guid)],
                'validation_status': 'VALID',
            },
        )
        assert post_resp.status_code == 200
        assert post_resp.json['name'] == 'boundary'
        assert post_resp.json['validation_status'] == 'VALID'

    def test_post_rejects_unknown_document_guids(self, test_client, db_session, auth_headers):
        import uuid

        mine = MineFactory()
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/document-bundle',
            headers=auth_headers['full_auth_header'],
            json={
                'name': 'boundary',
                'docman_bundle_guid': str(uuid.uuid4()),
                'document_manager_guids': [str(uuid.uuid4())],
            },
        )
        assert post_resp.status_code == 400

    def test_post_rejects_documents_from_another_mine(self, test_client, db_session, auth_headers):
        import uuid

        mine = MineFactory()
        mine_doc = MineDocumentFactory()
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/document-bundle',
            headers=auth_headers['full_auth_header'],
            json={
                'name': 'boundary',
                'docman_bundle_guid': str(uuid.uuid4()),
                'document_manager_guids': [str(mine_doc.document_manager_guid)],
            },
        )
        assert post_resp.status_code == 400

    def test_post_rejects_relinking_bundle_without_active_documents(self, test_client, db_session,
                                                                    auth_headers):
        mine_doc = MineDocumentFactory()
        document_bundle = MineDocumentBundleFactory()

        post_resp = test_client.post(
            f'/mines/{mine_doc.mine_guid}/document-bundle',
            headers=auth_headers['full_auth_header'],
            json={
                'name': document_bundle.name,
                'docman_bundle_guid': str(document_bundle.docman_bundle_guid),
                'document_manager_guids': [str(mine_doc.document_manager_guid)],
            },
        )

        assert post_resp.status_code == 400

    def test_post_rejects_view_only(self, test_client, db_session, auth_headers):
        mine = MineFactory()
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/document-bundle',
            headers=auth_headers['view_only_auth_header'],
            json={'name': 'boundary', 'document_manager_guids': ['not-a-guid']},
        )
        assert post_resp.status_code == 403
