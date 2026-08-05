import json
from app.api.now_applications.models.now_application_type import NOWApplicationType
from tests.factories import StandardPermitConditionsFactory, StandardReportPermitRequirementFactory, StandardReportReqConditionXrefFactory

def test_post_standard_report_permit_requirement(test_client, db_session, auth_headers):
    standard_condition = StandardPermitConditionsFactory()

    submission_data = {
        'due_date_period_months': 6,
        'cim_or_cpo': 'CIM',
        'ministry_recipient': ['HS'],
        'permit_condition_ids': [standard_condition.standard_permit_condition_id],
        'report_name': "Test Report"
    }

    post_resp = test_client.post(
        '/mines/reports/standard-permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201

    for key, value in submission_data.items():
        assert post_data[key] == value, f'mismatch with {key}, expected {value}, got {str(post_data[key])}'

    assert post_data['is_standard'] == True
    assert post_data['permit_amendment_id'] is None
    assert post_data['mine_report_permit_requirement_id'] is not None

def test_update_standard_report_requirement(test_client, db_session, auth_headers):
    # Create initial standard report requirement and xref using factories
    standard_condition = StandardPermitConditionsFactory()
    report_req = StandardReportPermitRequirementFactory(
        due_date_period_months=6,
        cim_or_cpo='CIM',
        ministry_recipient=['HS'],
        report_name="Test Report Update"
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=standard_condition,
        mine_report_permit_requirement=report_req
    )
    db_session.commit()

    # Update the report requirement
    update_data = {
        'mine_report_permit_requirement_id': report_req.mine_report_permit_requirement_id,
        'due_date_period_months': 12,
        'cim_or_cpo': 'CPO',
        'ministry_recipient': ['MMO'],
        'permit_condition_ids': [standard_condition.standard_permit_condition_id],
        'report_name': "Test Report Update"
    }
    put_resp = test_client.put(
        '/mines/reports/standard-permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=update_data
    )
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data['due_date_period_months'] == 12
    assert put_data['cim_or_cpo'] == 'CPO'
    assert put_data['ministry_recipient'] == ['MMO']
    assert put_data['permit_condition_ids'] == [standard_condition.standard_permit_condition_id]
    assert put_data['report_name'] == "Test Report Update"

def test_delete_standard_report_requirement(test_client, db_session, auth_headers):
    # Create initial standard report requirement and xref using factories
    standard_condition = StandardPermitConditionsFactory()
    report_req = StandardReportPermitRequirementFactory(
        due_date_period_months=6,
        cim_or_cpo='CIM',
        ministry_recipient=['HS'],
        report_name="Test Report Delete"
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=standard_condition,
        mine_report_permit_requirement=report_req
    )
    db_session.commit()

    # Delete the report requirement
    delete_resp = test_client.delete(
        f"/mines/reports/standard-permit-requirements?mine_report_permit_requirement_id={report_req.mine_report_permit_requirement_id}",
        headers=auth_headers['full_auth_header'],
    )
    assert delete_resp.status_code == 204

def test_post_duplicate_standard_report_requirement_bad_request(test_client, db_session, auth_headers):
    # Create initial standard report requirement and xref using factories
    standard_condition = StandardPermitConditionsFactory()
    report_req = StandardReportPermitRequirementFactory(
        due_date_period_months=6,
        cim_or_cpo='CIM',
        ministry_recipient=['HS'],
        report_name="DUPLICATE_STANDARD_REPORT_NAME_TEST",
        condition_category_code=standard_condition.condition_category_code,
        notice_of_work_type=standard_condition.notice_of_work_type
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=standard_condition,
        mine_report_permit_requirement=report_req
    )
    db_session.commit()

    # Attempt to create duplicate via POST
    submission_data = {
        'due_date_period_months': 6,
        'cim_or_cpo': 'CIM',
        'ministry_recipient': ['HS'],
        'permit_condition_ids': [standard_condition.standard_permit_condition_id],
        'report_name': "DUPLICATE_STANDARD_REPORT_NAME_TEST"
    }
    post_resp_2 = test_client.post(
        '/mines/reports/standard-permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    assert post_resp_2.status_code == 400
    data = json.loads(post_resp_2.data.decode())
    assert "Report name must be unique" in data.get("message", "")

def test_post_same_report_name_different_template_succeeds(test_client, db_session, auth_headers):
    now_type_codes = [x.notice_of_work_type_code for x in NOWApplicationType.get_all()]
    assert len(now_type_codes) >= 2, "Test requires at least two seeded notice_of_work_type codes"

    condition_a = StandardPermitConditionsFactory(notice_of_work_type=now_type_codes[0])
    condition_b = StandardPermitConditionsFactory(
        notice_of_work_type=now_type_codes[1],
        condition_category_code=condition_a.condition_category_code
    )

    report_req = StandardReportPermitRequirementFactory(
        due_date_period_months=6,
        cim_or_cpo='CIM',
        ministry_recipient=['HS'],
        report_name="SAME_NAME_DIFFERENT_TEMPLATE_TEST",
        condition_category_code=condition_a.condition_category_code,
        notice_of_work_type=condition_a.notice_of_work_type
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=condition_a,
        mine_report_permit_requirement=report_req
    )
    db_session.commit()

    # Same report_name, but linked to a condition belonging to a different template
    # (different notice_of_work_type) -> should succeed.
    submission_data = {
        'due_date_period_months': 6,
        'cim_or_cpo': 'CIM',
        'ministry_recipient': ['HS'],
        'permit_condition_ids': [condition_b.standard_permit_condition_id],
        'report_name': "SAME_NAME_DIFFERENT_TEMPLATE_TEST"
    }
    post_resp = test_client.post(
        '/mines/reports/standard-permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    assert post_resp.status_code == 201

def test_post_same_report_name_different_category_same_template_fails(test_client, db_session, auth_headers):
    # Standard conditions in the SAME template (same notice_of_work_type) but DIFFERENT condition_category_code
    condition_cat1 = StandardPermitConditionsFactory(
        notice_of_work_type='SAG',
        condition_category_code='GNC'
    )
    condition_cat2 = StandardPermitConditionsFactory(
        notice_of_work_type='SAG',
        condition_category_code='HSC'
    )

    report_req = StandardReportPermitRequirementFactory(
        due_date_period_months=6,
        cim_or_cpo='CIM',
        ministry_recipient=['HS'],
        report_name="SAME_TEMPLATE_DIFF_CAT_TEST",
        condition_category_code=condition_cat1.condition_category_code,
        notice_of_work_type=condition_cat1.notice_of_work_type
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=condition_cat1,
        mine_report_permit_requirement=report_req
    )
    db_session.commit()

    # Attempting to use the same report_name in the same template under a different category should fail
    submission_data = {
        'due_date_period_months': 6,
        'cim_or_cpo': 'CIM',
        'ministry_recipient': ['HS'],
        'permit_condition_ids': [condition_cat2.standard_permit_condition_id],
        'report_name': "SAME_TEMPLATE_DIFF_CAT_TEST"
    }
    post_resp = test_client.post(
        '/mines/reports/standard-permit-requirements',
        headers=auth_headers['full_auth_header'],
        json=submission_data
    )
    assert post_resp.status_code == 400
    data = json.loads(post_resp.data.decode())
    assert "Report name must be unique" in data.get("message", "")