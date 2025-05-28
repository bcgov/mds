import json
from datetime import date

from app.api.mines.reports.models.mine_report_permit_requirement import OfficeDestination
from tests.factories import create_mine_and_permit, MineReportPermitRequirementFactory, MineReportReqPermitConditionXrefFactory, MineReportFactory, PermitConditionsFactory, PermitAmendmentFactory
from app.api.mines.reports.models.mine_report_permit_requirement import (
    MineReportPermitRequirement,
)


def test_post_mine_report_permit_requirement(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    amendment = permit.permit_amendments[0]
    condition = amendment.conditions[0]

    submission_data = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': [OfficeDestination.MMO.value, OfficeDestination.HS.value],
        'permit_amendment_id': amendment.permit_amendment_id,
        'permit_condition_ids': [condition.permit_condition_id]
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert post_data['due_date_period_months'] == 6
    assert post_data['initial_due_date'] == date.today().strftime('%Y-%m-%d')
    assert post_data['cim_or_cpo'] == 'CIM'
    assert post_data['ministry_recipient'] == ['MMO', 'HS']
    assert post_data['permit_condition_ids'] == [condition.permit_condition_id]

def test_delete_mine_report_permit_requirement(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    condition = amendment.conditions[0]

    report_requirement = MineReportPermitRequirementFactory(
        permit_amendment=amendment
    )
    MineReportReqPermitConditionXrefFactory(
        permit_condition=condition,
        mine_report_permit_requirement=report_requirement
    )

    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/reports/permit-requirements?mine_report_permit_requirement_id={report_requirement.mine_report_permit_requirement_id}',
        headers=auth_headers['full_auth_header'],
    )

    mine_report_permit_requirement = MineReportPermitRequirement.find_by_mine_report_permit_requirement_id(
        report_requirement.mine_report_permit_requirement_id
    )

    assert delete_resp.status_code == 204
    assert mine_report_permit_requirement is None

def test_update_mine_report_permit_requirement(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]

    report_requirement = MineReportPermitRequirementFactory(
        permit_amendment=amendment
    )

    permit_conditions = [amendment.conditions[0], amendment.conditions[1]]
    permit_condition_ids = [c.permit_condition_id for c in permit_conditions]
    
    for c in permit_conditions:
        MineReportReqPermitConditionXrefFactory(
            permit_condition=c,
            mine_report_permit_requirement=report_requirement
        )

    submission_data = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': report_requirement.ministry_recipient,
        'permit_condition_ids': report_requirement.permit_condition_ids,
        'permit_amendment_id': report_requirement.permit_amendment_id,
        'mine_report_permit_requirement_id': report_requirement.mine_report_permit_requirement_id,
    }

    update_resp = test_client.put(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data,
    )

    update_data = json.loads(update_resp.data.decode())

    assert update_resp.status_code == 200
    assert update_data['due_date_period_months'] == 6
    assert update_data['initial_due_date'] == date.today().strftime('%Y-%m-%d')
    assert update_data['cim_or_cpo'] == 'CIM'
    assert update_data['ministry_recipient'] == report_requirement.ministry_recipient
    assert update_data['permit_condition_ids'] == permit_condition_ids
    assert update_data['mine_report_permit_requirement_id'] == report_requirement.mine_report_permit_requirement_id

def test_post_duplicate_mine_report_permit_requirement_returns_bad_request(test_client, db_session, auth_headers):
    """Test that posting a duplicate report_name returns a 400 Bad Request with an appropriate error message."""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    condition = amendment.conditions[0]

    duplicate_report_name = "DUPLICATE_REPORT_NAME_TEST"

    submission_data = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': [OfficeDestination.MMO.value, OfficeDestination.HS.value],
        'permit_amendment_id': amendment.permit_amendment_id,
        'permit_condition_ids': [condition.permit_condition_id],
        'report_name': duplicate_report_name
    }

    # First post should succeed
    post_resp_1 = test_client.post(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    assert post_resp_1.status_code == 201

    # Second post with the same report_name should fail
    post_resp_2 = test_client.post(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    assert post_resp_2.status_code == 400
    data = json.loads(post_resp_2.data.decode())
    assert "Report name must be unique" in data.get("message", "")

def test_update_mine_report_permit_requirement_duplicate_report_name_returns_bad_request(test_client, db_session, auth_headers):
    """Test that updating a report requirement to a duplicate report_name returns a 400 Bad Request with an appropriate error message."""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    condition = amendment.conditions[0]
    condition2 = amendment.conditions[1]

    # Create two report requirements with different names
    report_name_1 = "REPORT_NAME_1"
    report_name_2 = "REPORT_NAME_2"

    # First requirement
    submission_data_1 = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': [OfficeDestination.MMO.value, OfficeDestination.HS.value],
        'permit_amendment_id': amendment.permit_amendment_id,
        'permit_condition_ids': [condition.permit_condition_id],
        'report_name': report_name_1
    }
    post_resp_1 = test_client.post(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data_1
    )
    assert post_resp_1.status_code == 201
    data_1 = json.loads(post_resp_1.data.decode())

    # Second requirement
    submission_data_2 = {
        'due_date_period_months': 12,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CPO',
        'ministry_recipient': [OfficeDestination.MMO.value],
        'permit_amendment_id': amendment.permit_amendment_id,
        'permit_condition_ids': [condition2.permit_condition_id],
        'report_name': report_name_2
    }
    post_resp_2 = test_client.post(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data_2
    )
    assert post_resp_2.status_code == 201
    data_2 = json.loads(post_resp_2.data.decode())

    # Attempt to update the second requirement to have the same report_name as the first
    update_data = {
        'due_date_period_months': 12,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CPO',
        'ministry_recipient': [OfficeDestination.MMO.value],
        'permit_amendment_id': amendment.permit_amendment_id,
        'permit_condition_ids': [condition2.permit_condition_id],
        'mine_report_permit_requirement_id': data_2['mine_report_permit_requirement_id'],
        'report_name': report_name_1  # duplicate name
    }
    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/reports/permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=update_data
    )
    assert put_resp.status_code == 400
    put_resp_data = json.loads(put_resp.data.decode())
    assert "Report name must be unique" in put_resp_data.get("message", "")