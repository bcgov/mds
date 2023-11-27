import json, uuid
from app.extensions import cache
from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from tests.now_application_factories import NOWApplicationFactory, NOWApplicationIdentityFactory
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType


class TestGetNOWApplicationDocumentTypeResource:
    """GET /now-applications/application-document-types"""
    def test_get_application_document_types(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/now-applications/application-document-types',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == len(NOWApplicationDocumentType.get_all())

    def test_get_application_document_type(self, test_client, db_session, auth_headers):
        """Should return the a single document_type"""
        code = NOWApplicationDocumentType.get_all()[0].now_application_document_type_code
        get_resp = test_client.get(
            f'/now-applications/application-document-types/{code}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())

    def test_get_application_document_with_context(self, test_client, db_session, auth_headers):
        """Should return the rejection letter document type with form_spec with context-values"""
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)

        get_resp = test_client.get(
            f'/now-applications/application-document-types/RJL?context_guid={now_application_identity.now_application_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['document_template']
        assert get_data['document_template'].get('form_spec'), get_data
        mine_no_item = [
            x for x in get_data['document_template']['form_spec'] if x['id'] == "mine_no"
        ][0]
        assert mine_no_item
        assert mine_no_item['id'] == 'mine_no'
        assert mine_no_item['context-value'] == str(now_application_identity.mine.mine_no)

    def test_application_document_types_have_generation_spec(self, test_client, db_session,
                                                             auth_headers):
        """Should return the correct number of records with document_templates"""

        get_resp = test_client.get(
            f'/now-applications/application-document-types',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200
        get_data = json.loads(get_resp.data.decode())
        assert len([x for x in get_data['records'] if x['document_template']]) > 0
        assert len([x for x in get_data['records'] if x['document_template']]) == len(
            [x for x in NOWApplicationDocumentType.get_all() if x.document_template_code])

    def test_generate_document_not_found(self, test_client, db_session, auth_headers):
        """Should error is document type doesn't exist"""

        post_resp = test_client.post(
            f'/now-applications/application-document-types/ZZZ/generate',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 404

    def test_generate_document_not_supported(self, test_client, db_session, auth_headers):
        """Should error if document type exists but doesn't support generation"""

        post_resp = test_client.post(
            f'/now-applications/application-document-types/OTH/generate',
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400

    def test_generate_document_returns_token(self, test_client, db_session, auth_headers):
        """Should return the a token for successful generation"""
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)
        now_application.issuing_inspector.signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

        data = {
            'now_application_guid': now_application_identity.now_application_guid,
            'template_data': {
                'help': 'test'
            }
        }

        post_resp = test_client.post(
            f'/now-applications/application-document-types/CAL/generate',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200
        post_data = json.loads(post_resp.data.decode())
        assert post_data['token']

    def test_generate_document_returns_token(self, test_client, db_session, auth_headers):
        """Should return the a token for successful generation"""
        now_application = NOWApplicationFactory()
        now_application_identity = NOWApplicationIdentityFactory(now_application=now_application)
        now_application.issuing_inspector.signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="

        changed_mine_no = str(now_application_identity.mine.mine_no + '1')
        data = {
            'now_application_guid': now_application_identity.now_application_guid,
            'template_data': {
                'mine_no': changed_mine_no
            }
        }

        post_resp = test_client.post(
            f'/now-applications/application-document-types/RJL/generate',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert post_resp.status_code == 200
        post_data = json.loads(post_resp.data.decode())
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(post_data['token']))
        assert token_data is not None
        assert token_data['template_data']['mine_no'] != changed_mine_no
        assert post_data['token']