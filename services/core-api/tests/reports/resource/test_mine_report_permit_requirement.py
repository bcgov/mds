import json
from datetime import date

from app.api.mines.reports.models.mine_report_permit_requirement import OfficeDestination
from tests.factories import create_mine_and_permit


def test_post_mine_report_permit_requirement(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()

    amendment = permit.permit_amendments[0]
    condition = amendment.conditions[0]

    submission_data = {
        'due_date_period_months': 6,
        'initial_due_date': date.today().strftime('%Y-%m-%d'),
        'cim_or_cpo': 'CIM',
        'ministry_recipient': [OfficeDestination.MMO.value, OfficeDestination.HS.value],
        'permit_condition_id': condition.permit_condition_id,
        'permit_amendment_id': amendment.permit_amendment_id
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
    assert post_data['permit_condition_id'] == condition.permit_condition_id
