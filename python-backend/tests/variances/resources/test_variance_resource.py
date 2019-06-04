import json

from tests.factories import VarianceFactory


# GET
def test_get_variances(test_client, db_session, auth_headers):
    batch_size = 3
    variances = VarianceFactory.create_batch(size=batch_size)

    get_resp = test_client.get('/variances', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size
    assert all(
        str(variance.variance_guid) in map(lambda v: v['variance_guid'], get_data['records'])
        for variance in variances)
