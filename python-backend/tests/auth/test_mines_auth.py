import json
from ..constants import *


# GET Mines Auth
def test_get_mines_no_auth(test_client):
    get_resp = test_client.get('/mines', headers={})
    assert get_resp.status_code == 401


def test_get_mines_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mines_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mines', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# Get Mine Auth
def test_get_mine_no_auth(test_client):
    get_resp = test_client.get('/mine/' +  TEST_MINE_NO, headers={})
    assert get_resp.status_code == 401


def test_get_mine_view_only(test_client, auth_headers):
    get_resp = test_client.get('/mine/' +  TEST_MINE_NO, headers=auth_headers['view_only_auth_header'])
    assert get_resp.status_code == 200


def test_get_mine_full_auth(test_client, auth_headers):
    get_resp = test_client.get('/mine/' +  TEST_MINE_NO, headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 200


# POST Mine Auth
def test_post_mine_no_auth(test_client):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client.post('/mine', data=test_mine_data, headers={})
    assert post_resp.status_code == 401


def test_post_mine_view_only(test_client, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['view_only_auth_header'])
    assert post_resp.status_code == 401


def test_post_mine_full_auth(test_client, auth_headers):
    test_mine_data = {"name": "test_create_mine"}
    post_resp = test_client.post('/mine', data=test_mine_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200


# PUT Mine Auth
def test_put_mine_no_auth(test_client):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers={})
    assert put_resp.status_code == 401


def test_put_mine_view_only(test_client, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['view_only_auth_header'])
    assert put_resp.status_code == 401


def test_put_mine_full_auth(test_client, auth_headers):
    test_tenure_data = {'tenure_number_id': '1234568'}
    put_resp = test_client.put('/mine/' +  TEST_MINE_NO, data=test_tenure_data, headers=auth_headers['full_auth_header'])
    assert put_resp.status_code == 200