import json
import uuid

from tests.factories import create_mine_and_permit, StandardPermitConditionsFactory, PermitAmendmentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory


def test_post_standard_permit_condition_to_permit_amendment(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    standard_permit_condition = StandardPermitConditionsFactory()

    post_resp = test_client.post(
        f'mines/permits/amendments/{permit_amendment.permit_amendment_guid}/standard_permit_conditions/{standard_permit_condition.standard_permit_condition_guid}',
        headers=auth_headers['full_auth_header']
    )
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 201, post_resp.response
    assert str(post_data['message']) == 'Permit conditions successfully copied from standard permit conditions.'


def test_post_standard_permit_condition_to_permit_amendment_not_found(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    non_existent_guid = str(uuid.uuid4())

    post_resp = test_client.post(
        f'mines/permits/amendments/{permit_amendment.permit_amendment_guid}/standard_permit_conditions/{non_existent_guid}',
        headers=auth_headers['full_auth_header']
    )
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 404, post_resp.response
    assert str(post_data['message']) == '404 Not Found: No standard permit conditions found with that guid.'


def test_post_standard_permit_condition_to_non_draft_permit_amendment(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    standard_permit_condition = StandardPermitConditionsFactory()

    now_application_identity = NOWApplicationIdentityFactory(
        now_application=NOWApplicationFactory(), mine=mine, now_number=str(mine.mine_no) + '-2023'
    )

    non_draft_amendment = PermitAmendmentFactory(
        mine=mine,
        permit=permit,
        now_application_guid=now_application_identity.now_application_guid,
        permit_amendment_status_code='ACT',
        is_generated_in_core=True
    )

    post_resp = test_client.post(
        f'mines/permits/amendments/{non_draft_amendment.permit_amendment_guid}/standard_permit_conditions/{standard_permit_condition.standard_permit_condition_guid}',
        headers=auth_headers['full_auth_header']
    )
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400, post_resp.response
    assert str(post_data[
                   'message']) == '400 Bad Request: Permit Conditions cannot be edited if the permit was issued in Core and is no longer a draft.'
