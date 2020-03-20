import json, uuid
from app.api.mines.status.models.mine_status_xref import MineStatusXref


# GET
def test_get_mine_status_option(test_client, db_session, auth_headers):
    get_resp = test_client.get('/mines/status', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == len(MineStatusXref.get_active())
    assert get_resp.status_code == 200
