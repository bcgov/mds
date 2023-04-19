from flask_restplus import Resource, Namespace
from app.extensions import api as app_api
from app.api.utils.access_decorators import *

# TODO: Testing all new roles from Keycloak


class DummyResource(Resource):
    @requires_role_view_all
    def get(self):
        return "example view method"

    @requires_role_mine_edit
    def post(self):
        return "example create method"

    @requires_role_mine_admin
    def delete(self):
        return "example delete method"

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def put(self):
        return "example put method"


api = Namespace('test')
api.add_resource(DummyResource, '')
app_api.add_namespace(api)


# Test view role
def test_get_no_auth(test_client):
    resp = test_client.get('/test', headers={})
    assert resp.status_code == 401


def test_get_view_only(test_client, auth_headers):
    resp = test_client.get('/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 200


def test_get_create_only(test_client, auth_headers):
    resp = test_client.get('/test', headers=auth_headers['create_only_auth_header'])
    assert resp.status_code == 403


def test_get_admin_only(test_client, auth_headers):
    resp = test_client.get('/test', headers=auth_headers['admin_only_auth_header'])
    assert resp.status_code == 403


def test_get_proponent_only(test_client, auth_headers):
    resp = test_client.get('/test', headers=auth_headers['proponent_only_auth_header'])
    assert resp.status_code == 403


# Test create role
def test_post_no_auth(test_client):
    resp = test_client.post('/test', headers={})
    assert resp.status_code == 401


def test_post_view_only(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 403


def test_post_create_only(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['create_only_auth_header'])
    assert resp.status_code == 200


def test_post_admin_only(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['admin_only_auth_header'])
    assert resp.status_code == 403


def test_post_proponent_only(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['proponent_only_auth_header'])
    assert resp.status_code == 403


# Test admin role
def test_delete_no_auth(test_client):
    resp = test_client.delete('/test', headers={})
    assert resp.status_code == 401


def test_delete_view_only(test_client, auth_headers):
    resp = test_client.delete('/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 403


def test_delete_create_only(test_client, auth_headers):
    resp = test_client.delete('/test', headers=auth_headers['create_only_auth_header'])
    assert resp.status_code == 403


def test_delete_admin_only(test_client, auth_headers):
    resp = test_client.delete('/test', headers=auth_headers['admin_only_auth_header'])
    assert resp.status_code == 200


def test_proponent_admin_only(test_client, auth_headers):
    resp = test_client.delete('/test', headers=auth_headers['proponent_only_auth_header'])
    assert resp.status_code == 403


# Test requires_any_of decorator
def test_put_no_auth(test_client):
    resp = test_client.put('/test', headers={})
    assert resp.status_code == 401


def test_put_view_only(test_client, auth_headers):
    resp = test_client.put('/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 200


def test_put_create_only(test_client, auth_headers):
    resp = test_client.put('/test', headers=auth_headers['create_only_auth_header'])
    assert resp.status_code == 403


def test_put_admin_only(test_client, auth_headers):
    resp = test_client.put('/test', headers=auth_headers['admin_only_auth_header'])
    assert resp.status_code == 403


def test_put_proponent_only(test_client, auth_headers):
    resp = test_client.put('/test', headers=auth_headers['proponent_only_auth_header'])
    assert resp.status_code == 200
