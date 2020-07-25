import pytest
from app.utils.access_decorators import UPLOAD_DOCUMENT_ROLES
from app.docman.resources.document import DocumentResource, DocumentListResource
from app.docman.resources.tusd_hooks import TusdHooks


@pytest.mark.parametrize("resource,method,expected_roles",
                         [(DocumentListResource, "get", []),
                          (DocumentListResource, "post", UPLOAD_DOCUMENT_ROLES),
                          (DocumentResource, "patch", UPLOAD_DOCUMENT_ROLES),
                          (DocumentResource, "head", UPLOAD_DOCUMENT_ROLES),
                          (TusdHooks, "post", UPLOAD_DOCUMENT_ROLES)])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
