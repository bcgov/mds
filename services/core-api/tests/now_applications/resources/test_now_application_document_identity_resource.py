import uuid
import json
from datetime import datetime, timedelta

from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineFactory


# class TestNOWApplicationStatus:
class TestNOWApplicationDocumentIdentity:
    """POST /now-applications/ID/document-identity"""
    def test_put_application_status(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        data = {
            'document_manager_document_guid': uuid.uuid4(),
            'messageid': 0,
            'documenturl': 'some_data',
            'filename': 'some_data',
            'documenttype': 'some_data',
            'description': 'some_data',
        }

        post_resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-identity',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200