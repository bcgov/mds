import json
from flask_restx import marshal

from tests.status_code_gen import *
from tests.factories import MineIncidentNoteFactory, MineIncidentFactory, MineFactory


class TestGetIncidentNotes:
    """GET /incidents/{mine_incident_guid}/notes"""
    def test_get_incident_notes(self, test_client, db_session, auth_headers):
        """Should return all records and a 200 response code"""

        # MineIncidentFactory creates 2 notes for each instance
        mine_incident_note_batch_size = 2
        mine_incident = MineIncidentFactory()

        get_resp = test_client.get(
            f'/incidents/{mine_incident.mine_incident_guid}/notes',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == mine_incident_note_batch_size


class TestPostIncidentNote:
    """POST /incidents/{mine_incident_guid}/notes"""
    def test_post_incident_note(self, test_client, db_session, auth_headers):
        """Should return the new incident note and a 201 response code"""

        mine_incident = MineIncidentFactory()
        test_incident_note_data = {'content': 'Test note content.'}

        post_resp = test_client.post(
            f'/incidents/{mine_incident.mine_incident_guid}/notes',
            json=test_incident_note_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 201, post_resp.response
        assert post_data['content'] == test_incident_note_data['content']

    def test_post_incident_note_empty_content(self, test_client, db_session, auth_headers):
        """Should return a 400 response code"""

        mine_incident = MineIncidentFactory()
        test_incident_note_data = {'content': ''}

        post_resp = test_client.post(
            f'/incidents/{mine_incident.mine_incident_guid}/notes',
            json=test_incident_note_data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response


class TestDeleteIncidentNote:
    """DELETE /incidents/{mine_incident_guid}/notes/{mine_incident_note_guid}"""
    def test_delete_incident_note(self, test_client, db_session, auth_headers):
        """Should delete the note and return a 204 response code"""

        batch_size = 3
        mine_incident = MineIncidentFactory()
        mine_incident_notes = MineIncidentNoteFactory.create_batch(
            size=batch_size, mine_incident_guid=mine_incident.mine_incident_guid)
        mine_incident_note_to_delete = mine_incident_notes[0]

        delete_resp = test_client.delete(
            f'/incidents/{mine_incident.mine_incident_guid}/notes/{mine_incident_note_to_delete.mine_incident_note_guid}',
            headers=auth_headers['full_auth_header'])
        assert delete_resp.status_code == 204
        assert mine_incident_note_to_delete.deleted_ind == True