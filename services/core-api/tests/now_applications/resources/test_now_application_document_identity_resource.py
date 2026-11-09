import uuid
import json
import pytest
from datetime import datetime, timedelta

from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineFactory


class TestNOWApplicationDocumentIdentity:
    """POST /now-applications/ID/document-identity"""

    def test_post_application_identity_document(self, test_client, db_session, auth_headers):
        mine = MineFactory(major_mine_ind=True)
        now_application = NOWApplicationFactory(application_progress=None)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=now_application, mine=mine)

        data = {
            'document_manager_document_guid': str(uuid.uuid4()),
            'messageid': now_application_identity.messageid,
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

        from app.api.mines.documents.models.mine_document import MineDocument
        mine_doc = MineDocument.query.filter_by(document_name='some_data').first()
        assert mine_doc is not None
        assert mine_doc.is_imported is True