from tests.factories import MineDocumentBundleFactory


class TestMineDocumentBundle():
    """Tests for GET/PATCH /mines/document-bundle"""

    def test_get_mine_document_bundle(self, test_client, db_session, auth_headers):
        document_bundle = MineDocumentBundleFactory()

        get_resp = test_client.get(
            f'/mines/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200
        data = get_resp.json
        assert data['bundle_id'] == document_bundle.bundle_id
        assert 'purpose_codes' in data
        assert 'validation_status' in data

    def test_get_mine_document_bundle_invalid_id(self, test_client, db_session, auth_headers):
        get_resp = test_client.get(
            f'/mines/document-bundle/invalid_id',
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
                is_exclusive_per_parent=False,
            ).save()

        document_bundle = MineDocumentBundleFactory()
        patch_resp = test_client.patch(
            f'/mines/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header'],
            json={'purpose_codes': ['MBD']},
        )
        assert patch_resp.status_code == 200
        assert 'MBD' in patch_resp.json['purpose_codes']

    def test_post_creates_bundle(self, test_client, db_session, auth_headers):
        import uuid

        from tests.factories import MineDocumentFactory

        mine_doc = MineDocumentFactory()
        post_resp = test_client.post(
            '/mines/document-bundle',
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

        post_resp = test_client.post(
            '/mines/document-bundle',
            headers=auth_headers['full_auth_header'],
            json={
                'name': 'boundary',
                'docman_bundle_guid': str(uuid.uuid4()),
                'document_manager_guids': [str(uuid.uuid4())],
            },
        )
        assert post_resp.status_code == 400

    def test_post_rejects_view_only(self, test_client, db_session, auth_headers):
        post_resp = test_client.post(
            '/mines/document-bundle',
            headers=auth_headers['view_only_auth_header'],
            json={'name': 'boundary', 'document_manager_guids': ['not-a-guid']},
        )
        assert post_resp.status_code == 403

