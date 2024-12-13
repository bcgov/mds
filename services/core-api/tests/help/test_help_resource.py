import json
import uuid
from datetime import datetime, timedelta, date
from app.api.help.resources.help_resource import SystemFlag

HELP_POST_DATA = {
    "content": "<p>help content</p>",
    "help_key": "Test-Key",
    "page_tab": "all_tabs",
    "system": "MineSpace"
}

def test_get_all_help_core(test_client, db_session, auth_headers):
    # core get all should return CORE + MS records (by default 1 of each)
    get_resp = test_client.get(
        '/help', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert len(get_data['records']) == 2

    first_record_system = get_data['records'][0]['system']
    second_record_system = get_data['records'][1]['system']
    systems = [first_record_system, second_record_system]
    
    assert str(SystemFlag.ms) in systems
    assert str(SystemFlag.core) in systems

def test_get_all_help_ms(test_client, db_session, auth_headers):
    # proponent should only get the single default result
    get_resp = test_client.get(
        '/help', headers=auth_headers['proponent_only_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert len(get_data['records']) == 1

    system = get_data['records'][0]['system']
    
    assert system == str(SystemFlag.ms)

def test_post_help_core(test_client, db_session, auth_headers):
    # post is allowed with core helpdesk auth
    
    post_resp = test_client.post(
        '/help/Test-Key', json=HELP_POST_DATA, headers=auth_headers['full_auth_header'])
    
    assert post_resp.status_code == 201

    post_data = json.loads(post_resp.data.decode())
    assert all(
        str(post_data[k]) == str(HELP_POST_DATA[k])
        for k in HELP_POST_DATA.keys()
    )
def test_post_help_ms(test_client, db_session, auth_headers):
    # post not allowed with ms auth
    
    post_resp = test_client.post(
        '/help/Test-Key', json=HELP_POST_DATA, headers=auth_headers['proponent_only_auth_header'])
    
    assert post_resp.status_code == 403

def test_get_put_help_core(test_client, db_session, auth_headers):
    # get should return the matching record + system
    get_resp = test_client.get(
        '/help/default?system=CORE', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert len(get_data['records']) == 1

    record = get_data['records'][0]

    # put with modifying that data should update the data
    record['content'] = "<p>Brand new, updated content</p>"
    put_resp = test_client.put(
        '/help/default', json=record, headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())

    assert put_data['update_user'] == 'mds'

    assert put_data['content'] == record['content']
    assert put_data['help_guid'] == record['help_guid']
    assert put_data['help_key'] == record['help_key']
    assert put_data['page_tab'] == record['page_tab']
    assert put_data['system'] == record['system']

def test_get_core_on_ms(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/help/default?system=CORE', headers=auth_headers['proponent_only_auth_header'])
    assert get_resp.status_code == 400

def test_get_put_help_ms(test_client, db_session, auth_headers):
    # get should return the matching record + system
    get_resp = test_client.get(
        '/help/default?system=MineSpace', headers=auth_headers['proponent_only_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert len(get_data['records']) == 1

    record = get_data['records'][0]

    # put with modifying that data should be denied
    record['content'] = "<p>Brand new, updated content</p>"
    put_resp = test_client.put(
        '/help/default', json=record, headers=auth_headers['proponent_only_auth_header'])
    
    assert put_resp.status_code == 403
