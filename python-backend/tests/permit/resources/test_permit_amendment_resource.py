import json, pytest
from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID, DUMMY_USER_KWARGS
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit
from app.extensions import db


@pytest.fixture(scope='function')
def setup_info(test_client):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)

    test_pa = PermitAmendment.create(permit, None, None, None, DUMMY_USER_KWARGS)
    test_pa.save()
    yield {'permit_amendment_1': test_pa}

    db.session.delete(test_pa)
    db.session.commit()


# GET
def test_get_permit_amendment_by_guid(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/permits/amendments/' + {setup_info['permit_amendment_1'].permit_amendment_guid},
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['permit_amendment_guid'] == setup_info[
        'permit_amendment_1'].permit_amendment_guid


def test_get_permit_amendment_not_found(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        '/permits/amendments/' + TEST_PERMIT_GUID_1, headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 404
    assert get_data['error']['message'] is not None


def test_get_permit_amendment_by_permit(test_client, auth_headers, setup_info):
    get_resp = test_client.get(
        f'/permits/{TEST_PERMIT_GUID_1}/amendments', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert all(pa['permit_id'] == TEST_PERMIT_GUID_1 for pa in get_data)


#POST

#PUT

#DELETE