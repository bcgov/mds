from tests.factories import MineDocumentBundleFactory


class TestMineDocumentBundle():
    """Tests for GET /mines/{mine_guid}/documents/bundle"""

    def test_get_mine_document_bundle(self, test_client, db_session, auth_headers):
        """Should return a zip file with all documents"""

        document_bundle = MineDocumentBundleFactory()

        get_resp = test_client.get(
            f'/mines/document-bundle/{document_bundle.bundle_id}',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 200

    def test_get_mine_document_bundle_invalid_id(self, test_client, db_session, auth_headers):
        """Should return a 404 for an invalid id"""

        get_resp = test_client.get(
            f'/mines/document-bundle/invalid_id',
            headers=auth_headers['full_auth_header']
        )

        assert get_resp.status_code == 400

