from tests.constants import TEST_PERMITTEE_GUID
from app.api.permits.permittee.models.permittee import Permittee


# Permit Model Class Methods
def test_permittee_model_find_by_permit_guid(test_client, auth_headers):
    permittee = Permittee.find_by_permittee_guid(TEST_PERMITTEE_GUID)
    assert str(permittee.permittee_guid) == TEST_PERMITTEE_GUID
