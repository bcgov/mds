import json

from tests.factories import VarianceFactory, MineFactory


# GET
def test_get_variance(test_client, db_session, auth_headers):
    mine = MineFactory()
    variance = VarianceFactory(mine=mine)

    get_resp = test_client.get(f'/mines/{mine.mine_guid}/variances/{variance.variance_id}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['variance_id'] == variance.variance_id


def test_get_variance_invalid_variance_id(test_client, db_session, auth_headers):
    mine = MineFactory()
    variance = VarianceFactory()

    get_resp = test_client.get(f'/mines/{mine.mine_guid}/variances/1234', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
