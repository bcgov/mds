import json
from ..constants import *


def test_get_mines(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mines': [{'guid': '4fc855aa-728a-48f2-a3df-85ce1336b01a',
        'mine_name': 'test_mine_name', 'mine_no': 'BLAH000'}],
        'has_next': False,
        'has_prev': False,
        'next_num': None,
        'prev_num': None,
        'current_page': 1,
        'total_pages': 1,
        'items_per_page': 50,
        'total': 1
        }
    assert get_resp.status_code == 200
    assert get_data['mines'][0]['guid'] == TEST_MINE_GUID


def test_get_mines_empty(test_client, auth_headers):
    get_resp = test_client.get('/mines?page=2', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    context = {
        'mines': [],
        'has_next': False,
        'has_prev': True,
        'next_num': None,
        'prev_num': 1,
        'current_page': 2,
        'total_pages': 1,
        'items_per_page': 50,
        'total': 1
        }
    assert get_resp.status_code == 200
    assert get_data == context