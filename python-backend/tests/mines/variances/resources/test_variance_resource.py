import json

from tests.factories import VarianceFactory, MineFactory
from app.api.mines.variances.models.variance import INVALID_MINE_GUID


# GET
def test_get_variance(test_client, db_session, auth_headers):
    variance = VarianceFactory()

    get_resp = test_client.get(
        f'/mines/{variance.mine_guid}/variances/{variance.variance_id}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['variance_id'] == variance.variance_id


def test_get_variance_invalid_variance_id(test_client, db_session, auth_headers):
    variance = VarianceFactory()

    get_resp = test_client.get(
        f'/mines/{variance.mine_guid}/variances/1234',
        headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404


def test_get_variances_invalid_mine_guid(test_client, db_session, auth_headers):
    variance = VarianceFactory()

    get_resp = test_client.get(
        f'/mines/abc123/variances/{variance.variance_id}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 400
    assert get_data['message'] == INVALID_MINE_GUID


def test_get_variances_wrong_mine_guid(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    mine = MineFactory()

    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/variances/{variance.variance_id}',
        headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404


# PUT
def test_put_variance(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    # Use factory to get valid valuse
    approved_variance = VarianceFactory(approved=True)
    data = {
        'compliance_article_id': approved_variance.compliance_article_id,
        'received_date': approved_variance.received_date,
        'variance_application_status_code': approved_variance.variance_application_status_code,
        'ohsc_ind': True,
        'union_ind': True,
        'inspector_id': approved_variance.inspector_id,
        'note': approved_variance.note,
        'issue_date': approved_variance.issue_date,
        'expiry_date': approved_variance.expiry_date
    }

    put_resp = test_client.put(
        f'/mines/{variance.mine_guid}/variances/{variance.variance_id}',
        headers=auth_headers['full_auth_header'],
        data=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert put_data['compliance_article_id'] == data['compliance_article_id']
    assert put_data['received_date'] == data['received_date'].strftime('%Y-%m-%d')
    assert put_data['variance_application_status_code'] == data['variance_application_status_code']
    assert put_data['ohsc_ind'] == data['ohsc_ind']
    assert put_data['union_ind'] == data['union_ind']
    assert put_data['inspector_id'] == data['inspector_id']
    assert put_data['note'] == data['note']
    assert put_data['issue_date'] == data['issue_date'].strftime('%Y-%m-%d')
    assert put_data['expiry_date'] == data['expiry_date'].strftime('%Y-%m-%d')


def test_put_variance_invalid(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    # Use factory to get valid valuse
    approved_variance = VarianceFactory(approved=True)
    data = {
        'compliance_article_id': approved_variance.compliance_article_id,
        'received_date': approved_variance.received_date,
        # issue/expiry_date not allowed with REV status
        'variance_application_status_code': 'REV',
        'ohsc_ind': True,
        'union_ind': True,
        'inspector_id': approved_variance.inspector_id,
        'note': approved_variance.note,
        'issue_date': approved_variance.issue_date,
        'expiry_date': approved_variance.expiry_date
    }

    put_resp = test_client.put(
        f'/mines/{variance.mine_guid}/variances/{variance.variance_id}',
        headers=auth_headers['full_auth_header'],
        data=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 400, put_resp.response


def test_put_variance_invalid_variance_id(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    # Use factory to get valid valuse
    approved_variance = VarianceFactory(approved=True)
    data = {
        'compliance_article_id': approved_variance.compliance_article_id,
        'received_date': approved_variance.received_date,
        # issue/expiry_date not allowed with REV status
        'variance_application_status_code': 'REV',
        'ohsc_ind': True,
        'union_ind': True,
        'inspector_id': approved_variance.inspector_id,
        'note': approved_variance.note,
        'issue_date': approved_variance.issue_date,
        'expiry_date': approved_variance.expiry_date
    }

    put_resp = test_client.put(
        f'/mines/{variance.mine_guid}/variances/1234',
        headers=auth_headers['full_auth_header'],
        data=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 404
