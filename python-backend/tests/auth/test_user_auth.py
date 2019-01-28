import json
import pytest
from flask_restplus import Resource, Namespace
from app.extensions import api as app_api
from app.api.utils.access_decorators import *
from app import auth

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine


class DummyAuthResource(Resource):
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):
        user_security = auth.get_current_user_security()
        return user_security.is_restricted()

    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def post(self):
        user_security = auth.get_current_user_security()
        return user_security.is_restricted()

    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def delete(self):
        user_security = auth.get_current_user_security()
        return user_security.is_restricted()

    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def put(self):
        user_security = auth.get_current_user_security()
        return user_security.is_restricted()


api = Namespace('authtest')
api.add_resource(DummyAuthResource, '')
app_api.add_namespace(api)


@pytest.fixture(scope="function")
def setup_info(test_client):
    auth.clear_cache()


def test_setup_data(test_client):
    mu = MinespaceUser.create_minespace_user('test-proponent-email@minespace.ca')
    mu.save()


# Test no role
def test_get_no_auth(test_client):
    resp = test_client.get('/authtest', headers={})
    assert resp.status_code == 401


# Test view
def test_get_view_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.get('/authtest', headers=auth_headers['view_only_auth_header'])
    assert json.loads(resp.data.decode()) == False


# Test proponent
def test_get_proponent_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.get('/authtest', headers=auth_headers['proponent_only_auth_header'])
    assert json.loads(resp.data.decode()) == True


# Test no role
def test_put_no_auth(test_client):
    resp = test_client.put('/authtest', headers={})
    assert resp.status_code == 401


# Test view
def test_put_view_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.put('/authtest', headers=auth_headers['view_only_auth_header'])
    assert json.loads(resp.data.decode()) == False


# Test proponent
def test_put_proponent_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.put('/authtest', headers=auth_headers['proponent_only_auth_header'])
    assert json.loads(resp.data.decode()) == True


# Test no role
def test_post_no_auth(test_client):
    resp = test_client.post('/authtest', headers={})
    assert resp.status_code == 401


# Test view
def test_post_view_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.post('/authtest', headers=auth_headers['view_only_auth_header'])
    assert json.loads(resp.data.decode()) == False


# Test proponent
def test_post_proponent_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.post('/authtest', headers=auth_headers['proponent_only_auth_header'])
    assert json.loads(resp.data.decode()) == True


# Test no role
def test_delete_no_auth(test_client):
    resp = test_client.delete('/authtest', headers={})
    assert resp.status_code == 401


# Test view
def test_delete_view_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.delete('/authtest', headers=auth_headers['view_only_auth_header'])
    assert json.loads(resp.data.decode()) == False


# Test proponent
def test_delete_proponent_auth_applies(test_client, auth_headers, setup_info):
    resp = test_client.delete('/authtest', headers=auth_headers['proponent_only_auth_header'])
    assert json.loads(resp.data.decode()) == True
