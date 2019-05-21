import pytest
from app.nris.utils.access_decorators import NRIS_VIEW

#from app.nris.resources.test_resource import FactorialResource

# @pytest.mark.parametrize("resource,method,expected_roles",
#                          [(FactorialResource, "get", [NRIS_VIEW])])
# def test_endpoint_auth(resource, method, expected_roles):
#     endpoint = getattr(resource, method, None)
#     assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

#     assigned_roles = getattr(endpoint, "required_roles", [])
#     assert set(expected_roles) == set(
#         assigned_roles
#     ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
#         resource.__name__, method.upper(), expected_roles, assigned_roles)
