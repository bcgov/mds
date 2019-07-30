import pytest
import json
import uuid

from tests.status_code_gen import RandomIncidentDocumentType
from tests.factories import (MineIncidentFactory, MineFactory, MineDocumentFactory,
                             VarianceDocumentFactory)


class TestPutIncidentDocument:
    """PUT /mines/{mine_guid}/incidents/{mine_incident_guid}/documents/{}"""

    def test_put_file(self, test_client, db_session, auth_headers):
        """Should add a document to a Mine Incident"""

        mine = MineFactory()
        incident = MineIncidentFactory(mine=mine)
        document_count = len(incident.documents)
        data = {
            'document_manager_guid': uuid.uuid4(),
            'filename': 'my_document.pdf',
            'mine_incident_document_type': RandomIncidentDocumentType()
        }

        # FIXME: This endpoint is set up with a required param that is ignored
        put_resp = test_client.put(
            f'/mines/{mine.mine_guid}/incidents/{incident.mine_incident_guid}/documents/12345',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 200, put_resp.response
        assert len(put_data['documents']) == document_count + 1


class TestDeleteIncidentDocument:
    """DELETE /mines/{mine_guid}/incidents/{mine_incident_guid}/documents/{mine_document_guid}"""

    def test_file_removal(self, test_client, db_session, auth_headers):
        """Should dissociate a document from a Mine Incident"""

        incident = MineIncidentFactory()
        incident_document = incident.documents[0]
        document_count = len(incident.documents)
        assert incident_document is not None

        delete_resp = test_client.delete(
            f'/mines/{incident.mine_guid}/incidents/{incident.mine_incident_guid}/documents/{incident_document.mine_document_guid}',
            headers=auth_headers['full_auth_header'])
        assert delete_resp.status_code == 204
        assert len(incident.documents) == document_count - 1


    def test_file_removal_not_on_incident(self, test_client, db_session, auth_headers):
        """Should return a 404"""

        incident = MineIncidentFactory()
        mine_document_guid = MineDocumentFactory().mine_document_guid

        delete_resp = test_client.delete(
            f'/mines/{incident.mine_guid}/incidents/{incident.mine_incident_guid}/documents/{mine_document_guid}',
            headers=auth_headers['full_auth_header'])
        assert delete_resp.status_code == 404
