import pytest

def test_get_distribution_lists(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/ministry-contacts/distribution-lists',
        headers=auth_headers['full_auth_header']
    )
    assert get_resp.status_code == 200
    
    get_data = get_resp.json
    assert 'records' in get_data
    assert type(get_data['records']) == list
