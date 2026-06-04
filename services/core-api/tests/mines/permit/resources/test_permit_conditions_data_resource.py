import json
import uuid

from tests.factories import create_mine_and_permit, PermitConditionsFactory


# GET
def test_get_permit_conditions_data_success(test_client, db_session, auth_headers):
    """Should return 200 with slim amendment fields for a valid amendment."""
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    PermitConditionsFactory.create_batch(size=2, permit_amendment=permit_amendment)

    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions-data',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200, get_resp.response
    assert get_data['permit_amendment_guid'] == str(permit_amendment.permit_amendment_guid)
    assert 'conditions' in get_data
    assert 'condition_categories' in get_data


def test_get_permit_conditions_data_not_found(test_client, db_session, auth_headers):
    """Should return 404 when the amendment GUID does not exist."""
    mine, permit = create_mine_and_permit()

    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/permits/{permit.permit_guid}/amendments/{uuid.uuid4()}/conditions-data',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 404
    assert get_data['message'] is not None


def test_get_permit_conditions_data_mine_mismatch(test_client, db_session, auth_headers):
    """Should return 400 when the amendment belongs to a different mine."""
    mine, permit = create_mine_and_permit()
    other_mine, other_permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]

    get_resp = test_client.get(
        f'/mines/{other_mine.mine_guid}/permits/{permit.permit_guid}/amendments/{permit_amendment.permit_amendment_guid}/conditions-data',
        headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 400