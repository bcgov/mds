import json
from tests.factories import MineLocationFactory


def test_get_location_by_location_guid(test_client, db_session, auth_headers):
    loc_guid = MineLocationFactory().mine_location_guid

    get_resp = test_client.get('/mines/location/' + str(loc_guid), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_location_guid'] == str(loc_guid)
    assert get_resp.status_code == 200
