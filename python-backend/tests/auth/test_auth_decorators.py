from flask_restplus import Resource, Namespace
from app.extensions import api as app_api
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create


class DummyResource(Resource):
    @requires_role_mine_view
    def get(self):
        return "Example view method"

    @requires_role_mine_create
    def post(self):
        return "Example create method"

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


def test_get_full_auth(test_client, auth_headers):
    resp = test_client.get('/test', headers=auth_headers['full_auth_header'])
    assert resp.status_code == 200


# Test create role
def test_post_no_auth(test_client):
    resp = test_client.post('/test', headers={})
    assert resp.status_code == 401


def test_post_view_only(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 401


def test_post_full_auth(test_client, auth_headers):
    resp = test_client.post('/test', headers=auth_headers['full_auth_header'])
    assert resp.status_code == 200
