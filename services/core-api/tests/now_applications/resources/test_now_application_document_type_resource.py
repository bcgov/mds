import json

from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType


class TestGetNOWApplicationDocumentTypeResource:
    """GET /now-applications/application-document-types"""
    def test_get_application_document_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/application-document-types',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(NOWApplicationDocumentType.active())

    def test_application_document_types_have_generation_spec(self, test_client, db_session,
                                                             auth_headers):
        """Should return the correct number of records with document_templates"""

        get_resp = test_client.get(
            f'/now-applications/application-document-types',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len([x for x in get_data['records'] if x['document_template']]) > 0
        assert len([x for x in get_data['records'] if x['document_template']]) == len(
            [x for x in NOWApplicationDocumentType.active() if x.document_template_code])

    def test_generate_document_not_found(self, test_client, db_session, auth_headers):
        """Should error is document type doesn't exist"""

        post_resp = test_client.post(
            f'/now-applications/application-document-types/ZZZ/generate',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 404, post_resp.__dict__

    def test_generate_document_not_supported(self, test_client, db_session, auth_headers):
        """Should error if document type exists but doesn't support generation"""

        post_resp = test_client.post(
            f'/now-applications/application-document-types/OTH/generate',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        get_data = json.loads(post_resp.data.decode())

    def test_generate_document_returns_token(self, test_client, db_session, auth_headers):
        """Should return the a token for successful generation"""

        post_resp = test_client.post(
            f'/now-applications/application-document-types/{[x for x in NOWApplicationDocumentType.active() if x.document_template][0].now_application_document_type_code}/generate',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200
        get_data = json.loads(post_resp.data.decode())