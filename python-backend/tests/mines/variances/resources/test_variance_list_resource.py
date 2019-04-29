import json

from tests.factories import VarianceFactory, MineFactory
from tests.status_code_gen import RandomComplianceArticleId
from app.api.utils.custom_reqparser import DEFAULT_MISSING_REQUIRED


# GET
def test_get_variances_for_a_mine(test_client, db_session, auth_headers):
    batch_size = 3
    mine = MineFactory()
    VarianceFactory.create_batch(size=batch_size, mine=mine)
    VarianceFactory.create_batch(size=batch_size)

    get_resp = test_client.get(f'/mines/{mine.mine_guid}/variances', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == batch_size


def test_get_variances_invalid_mine_guid(test_client, db_session, auth_headers):
    batch_size = 3
    VarianceFactory.create_batch(size=batch_size)

    get_resp = test_client.get(f'/mines/abc123/variances', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 400


# POST
def test_post_variance(test_client, db_session, auth_headers):
    mine = MineFactory()
    test_variance_data = {
        'compliance_article_id': RandomComplianceArticleId(),
        'note': 'Biggest mine yet',
        'received_date': '2019-04-23',
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/variances', data=test_variance_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['compliance_article_id'] == test_variance_data['compliance_article_id']
    assert post_data['note'] == test_variance_data['note']
    assert post_data['received_date'] == test_variance_data['received_date']


def test_post_variance_missing_compliance_article_id(test_client, db_session, auth_headers):
    mine = MineFactory()
    test_variance_data = {
        "note": "Biggest mine yet",
        "issue_date": "2019-04-23",
        "received_date": "2019-04-23",
        "expiry_date": "2019-04-23",
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/variances', data=test_variance_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response
    assert DEFAULT_MISSING_REQUIRED in post_data['message']
