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

def test_update_mine_report_permit_requirement_remove_condition(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]

    report_requirement = MineReportPermitRequirementFactory(
        permit_amendment=amendment
    )

    permit_conditions = [amendment.conditions[0], amendment.conditions[1]]
    
    for c in permit_conditions:
        MineReportReqPermitConditionXrefFactory(
            permit_condition=c,
            mine_report_permit_requirement=report_requirement
        )

    # Only keep the first permit condition
    updated_permit_condition_ids = [permit_conditions[0].permit_condition_id]

    submission_data = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': report_requirement.ministry_recipient,
        'permit_condition_ids': updated_permit_condition_ids,
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
    assert update_data['permit_condition_ids'] == updated_permit_condition_ids
    assert update_data['mine_report_permit_requirement_id'] == report_requirement.mine_report_permit_requirement_id