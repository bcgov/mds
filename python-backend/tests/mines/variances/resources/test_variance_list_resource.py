import json

from tests.factories import VarianceFactory, MineFactory, PartyFactory
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
def test_post_variance_application(test_client, db_session, auth_headers):
    mine = MineFactory()
    party = PartyFactory(person=True)
    test_variance_data = {
        'compliance_article_id': RandomComplianceArticleId(),
        'note': 'Biggest mine yet',
        'received_date': '2019-04-23',
        'applicant_guid': party.party_guid
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/variances', data=test_variance_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['compliance_article_id'] == test_variance_data['compliance_article_id']
    assert post_data['note'] == test_variance_data['note']
    assert post_data['received_date'] == test_variance_data['received_date']
    assert post_data['applicant_guid'] == str(test_variance_data['applicant_guid'])


def test_post_approved_variance(test_client, db_session, auth_headers):
    # Use factory to get valid values
    approved_variance = VarianceFactory(approved=True)
    test_variance_data = {
        'compliance_article_id': approved_variance.compliance_article_id,
        'received_date': approved_variance.received_date,
        'variance_application_status_code': approved_variance.variance_application_status_code,
        'ohsc_ind': True,
        'union_ind': True,
        'inspector_id': approved_variance.inspector_id,
        'note': 'Biggest mine yet',
        'issue_date': approved_variance.issue_date,
        'expiry_date': approved_variance.expiry_date
    }
    post_resp = test_client.post(
        f'/mines/{approved_variance.mine_guid}/variances', data=test_variance_data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['compliance_article_id'] == test_variance_data['compliance_article_id']
    assert post_data['received_date'] == test_variance_data['received_date'].strftime('%Y-%m-%d')
    assert post_data['variance_application_status_code'] == test_variance_data['variance_application_status_code']
    assert post_data['ohsc_ind'] == test_variance_data['ohsc_ind']
    assert post_data['union_ind'] == test_variance_data['union_ind']
    assert post_data['inspector_id'] == test_variance_data['inspector_id']
    assert post_data['note'] == test_variance_data['note']
    assert post_data['issue_date'] == test_variance_data['issue_date'].strftime('%Y-%m-%d')
    assert post_data['expiry_date'] == test_variance_data['expiry_date'].strftime('%Y-%m-%d')


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
