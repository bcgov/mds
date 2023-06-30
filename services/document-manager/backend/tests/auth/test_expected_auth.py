import pytest
from app.utils.access_decorators import DOCUMENT_UPLOAD_ROLES
from app.docman.resources.document import DocumentResource, DocumentListResource
from app.docman.resources.document_version_list_resource import DocumentVersionListResource
from app.docman.resources.document_version_resource import DocumentVersionResource
from app.docman.resources.tusd_hooks import TusdHooks


@pytest.mark.parametrize("resource,method,expected_roles",
                         [(DocumentListResource, "get", []),
                          (DocumentListResource, "post", DOCUMENT_UPLOAD_ROLES),
                          (DocumentVersionListResource,
                           "post", DOCUMENT_UPLOAD_ROLES),
                          (DocumentVersionResource,
                           "post", DOCUMENT_UPLOAD_ROLES),
                          (DocumentResource, "patch", DOCUMENT_UPLOAD_ROLES),
                          (DocumentResource, "head", DOCUMENT_UPLOAD_ROLES),
                          (TusdHooks, "post", DOCUMENT_UPLOAD_ROLES)])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(
        resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
