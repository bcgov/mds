from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from tests.factories import (
    PermitAmendmentFactory, 
    StandardPermitConditionsFactory, 
    PermitConditionTagFactory, 
    StandardPermitConditionTagXrefFactory,
    StandardReportPermitRequirementFactory, 
    StandardReportReqConditionXrefFactory, 
    create_mine_and_permit,
)

def test_copy_permit_conditions_from_standard(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = PermitAmendmentFactory(conditions=0, mine=mine, permit=permit)

    standard_permit_conditions = StandardPermitConditionsFactory.create_batch(size=3)
    for i, c in enumerate(standard_permit_conditions):
        sub = StandardPermitConditions(
            condition=f"condition text {i}",
            condition_category_code=c.condition_category_code,
            condition_type_code="LIS",
            notice_of_work_type=c.notice_of_work_type,
            parent_standard_permit_condition_id=c.standard_permit_condition_id,
            display_order=i + 1,            
        )
        sub.save(commit=True)

    # tags + tag xrefs for standard conditions
    tag1 = PermitConditionTagFactory()
    tag2 = PermitConditionTagFactory()

    StandardPermitConditionTagXrefFactory(
        permit_condition_tag=tag1,
        standard_permit_condition=standard_permit_conditions[0]
    )
    StandardPermitConditionTagXrefFactory(
        permit_condition_tag=tag2,
        standard_permit_condition=standard_permit_conditions[2].sub_conditions[0]
    )

    # report requirements + condition xrefs for standard conditions
    # has 1 condition
    req1 = StandardReportPermitRequirementFactory()
    # has 2 conditions
    req2 = StandardReportPermitRequirementFactory()

    StandardReportReqConditionXrefFactory(
        permit_condition=standard_permit_conditions[0],
        mine_report_permit_requirement=req1
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=standard_permit_conditions[1],
        mine_report_permit_requirement=req2
    )
    StandardReportReqConditionXrefFactory(
        permit_condition=standard_permit_conditions[2].sub_conditions[0],
        mine_report_permit_requirement=req2
    )
    
    # copy over standard conditions to permit amendment
    PermitConditions.copy_from_standard(standard_permit_conditions, permit_amendment.permit_amendment_id)

    # check conditions were copied correctly
    assert len(permit_amendment.conditions) == len(standard_permit_conditions)
    for spc in standard_permit_conditions:
        matching_conditions = [c for c in permit_amendment.conditions if c.condition == spc.condition]
        assert len(matching_conditions) == 1
        copied_condition = matching_conditions[0]
        assert copied_condition.condition_category_code == spc.condition_category_code
        assert copied_condition.display_order == spc.display_order
        assert len(copied_condition.sub_conditions) == len(spc.sub_conditions)

        spc_sub = spc.sub_conditions[0]
        copied_sub = copied_condition.sub_conditions[0]
        assert copied_sub.condition == spc_sub.condition
        assert copied_sub.condition_category_code == spc_sub.condition_category_code
        assert copied_sub.display_order == spc_sub.display_order

        # check tags were copied correctly
        assert len(spc.condition_tags) == len(copied_condition.condition_tags)
        if (len(spc.condition_tags) > 0):
            assert spc.condition_tags[0] == copied_condition.condition_tags[0]
        # check tags on sub_conditions copy as well
        assert len(spc_sub.condition_tags) == len(copied_sub.condition_tags)
        if (len(spc_sub.condition_tags) > 0):
            assert spc_sub.condition_tags[0] == copied_sub.condition_tags[0]

    # check report req were copied correctly
    copied_report_req_1 = MineReportPermitRequirement.find_by_report_name(req1.report_name, permit_amendment.permit_amendment_id)
    copied_report_req_2 = MineReportPermitRequirement.find_by_report_name(req2.report_name, permit_amendment.permit_amendment_id)

    assert copied_report_req_1 is not None
    assert copied_report_req_2 is not None

    assert copied_report_req_1.due_date_period_months == req1.due_date_period_months
    assert copied_report_req_1.cim_or_cpo == req1.cim_or_cpo
    assert copied_report_req_1.ministry_recipient == req1.ministry_recipient
    assert len(copied_report_req_1.permit_conditions) == 1

    assert len(copied_report_req_2.permit_conditions) == 2
    expected_condition_ids = [permit_amendment.conditions[1].permit_condition_id, permit_amendment.conditions[2].sub_conditions[0].permit_condition_id]
    assert copied_report_req_2.permit_conditions[0].permit_condition_id in expected_condition_ids
    assert copied_report_req_2.permit_conditions[1].permit_condition_id in expected_condition_ids