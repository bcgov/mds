import json
import uuid

from tests.factories import (MineFactory, MinePartyAppointmentFactory)


class TestPutMinePartyAppointmentDocument:
    """PUT /mines/{mine_guid}/party-appt/{mine_party_appt_guid}/documents"""

    def test_put_file(self, test_client, db_session, auth_headers):
        """Should associate the MineDocument with the MinePartyAppointment and return 200"""

        mine = MineFactory()
        mpa = MinePartyAppointmentFactory(mine=mine)
        document_count = len(mpa.documents)
        data = {
            'document_manager_guid': uuid.uuid4(),
            'document_name': 'my_document.pdf',
            'mine_tailings_storage_facility_guid': uuid.uuid4()
        }

        put_resp = test_client.put(
            f'/mines/{mine.mine_guid}/party-appts/{mpa.mine_party_appt_guid}/documents',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 200, put_resp.response
        assert len(put_data['documents']) == document_count + 1
