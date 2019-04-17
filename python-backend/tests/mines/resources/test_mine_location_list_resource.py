import json
from tests.factories import MineFactory


def test_get_mines(test_client, db_session, auth_headers):
    mine = MineFactory()

    get_resp = test_client.get('/mines/location', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'mines': [{'mine_guid': str(mine.mine_guid), 'latitude': str(mine.mine_location.latitude), 'longitude': str(mine.mine_location.longitude)}]}
    assert get_resp.status_code == 200
