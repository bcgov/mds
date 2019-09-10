import pytest
from app.utils.access_decorators import VIEW_ALL, MINE_EDIT, MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE
from app.docman.resources.document import DocumentResource, DocumentListResource


@pytest.mark.parametrize(
    "resource,method,expected_roles",
    [(DocumentListResource, "get", []),
     (DocumentListResource, "post",
      [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_VARIANCE, EDIT_DO, MINESPACE_PROPONENT]),
     (DocumentResource, "patch",
      [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_VARIANCE, EDIT_DO, MINESPACE_PROPONENT]),
     (DocumentResource, "head",
      [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_VARIANCE, EDIT_DO, MINESPACE_PROPONENT])])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
