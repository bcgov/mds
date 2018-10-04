from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID
from app.api.permit.models.permit import Permit


# Permit Model Class Methods
def test_permit_model_find_by_permit_guid(test_client, auth_headers):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)
    assert str(permit.permit_guid) == TEST_PERMIT_GUID_1


def test_permit_model_find_by_mine_guid(test_client, auth_headers):
    permit = Permit.find_by_mine_guid(TEST_MINE_GUID)
    assert str(permit[0].mine_guid) == TEST_MINE_GUID
