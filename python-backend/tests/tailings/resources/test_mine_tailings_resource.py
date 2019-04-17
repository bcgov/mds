import json
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from tests.factories import MineFactory, MineTailingsStorageFacilityFactory


# GET
def test_get_mine_tailings_storage_facility_by_mine_guid(test_client, db_session, auth_headers):
    tsf = MineTailingsStorageFacilityFactory()

    get_resp = test_client.get(
        '/mines/tailings?mine_guid=' + str(tsf.mine_guid), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.respons
    assert len(get_data['mine_tailings_storage_facilities']) == 1


def test_post_mine_tailings_storage_facility_by_mine_guid(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    get_resp = test_client.get(
        '/mines/tailings?mine_guid=' + str(mine_guid), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    org_mine_tsf_list_len = len(get_data['mine_storage_tailings_facilities'])

    post_resp = test_client.post(
        '/mines/tailings',
        data={
            'mine_guid': str(mine_guid),
            'tsf_name': 'a name'
        },
        headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200
    assert len(post_data['mine_tailings_storage_facilities']) == org_mine_tsf_list_len + 1
    assert all(
        tsf['mine_guid'] == str(mine_guid) for tsf in post_data['mine_tailings_storage_facilities'])
