from flask_restx import Resource, Namespace
from app.extensions import api as app_api
from app.nris.utils.access_decorators import *


class DummyResource(Resource):
    @requires_role_nris_view
    def get(self):
        return "example view method"


api = Namespace('test')
api.add_resource(DummyResource, '')
app_api.add_namespace(api)


# Test view role
def test_get_no_auth(test_client):
    resp = test_client.get('/test', headers={})
    assert resp.status_code == 401


def test_get_view_only(test_client, auth_headers):
    resp = test_client.get(
        '/test', headers=auth_headers['view_only_auth_header'])
    assert resp.status_code == 200
