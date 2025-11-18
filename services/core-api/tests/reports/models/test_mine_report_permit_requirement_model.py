from datetime import date
from dateutil.relativedelta import relativedelta

from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from tests.factories import (
    MineReportPermitRequirementFactory,
    create_mine_and_permit
)


def test_mine_report_permit_requirement_get_all_recurring_returns_only_recurring_requirements(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    # Create a recurring requirement (quarterly)
    recurring_quarterly = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Quarterly Report",
        due_date_period_months=3,
        initial_due_date=date.today() - relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    # Create another recurring requirement (annual)
    recurring_annual = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Annual Report", 
        due_date_period_months=12,
        initial_due_date=date.today() - relativedelta(months=3),
        active_ind=True,
        deleted_ind=False
    )
    
    # Create a non-recurring requirement (due_date_period_months = 0)
    non_recurring = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="One-time Report",
        due_date_period_months=0,
        initial_due_date=date.today() + relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    # Get all recurring requirements
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    recurring_ids = [req.mine_report_permit_requirement_id for req in recurring_requirements]
    
    # Should include the recurring requirements but not the non-recurring one
    assert recurring_quarterly.mine_report_permit_requirement_id in recurring_ids
    assert recurring_annual.mine_report_permit_requirement_id in recurring_ids
    assert non_recurring.mine_report_permit_requirement_id not in recurring_ids


def test_mine_report_permit_requirement_get_all_recurring_excludes_inactive_requirements(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    # Create an active recurring requirement
    active_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Active Quarterly Report",
        due_date_period_months=3,
        initial_due_date=date.today() - relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    # Create an inactive recurring requirement
    inactive_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Inactive Quarterly Report",
        due_date_period_months=3,
        initial_due_date=date.today() - relativedelta(months=6),
        active_ind=False,  # Inactive
        deleted_ind=False
    )
    
    # Get all recurring requirements
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    recurring_ids = [req.mine_report_permit_requirement_id for req in recurring_requirements]
    
    # Should include only the active requirement
    assert active_requirement.mine_report_permit_requirement_id in recurring_ids
    assert inactive_requirement.mine_report_permit_requirement_id not in recurring_ids


def test_mine_report_permit_requirement_get_all_recurring_excludes_deleted_requirements(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    # Create a non-deleted recurring requirement
    valid_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Valid Quarterly Report",
        due_date_period_months=3,
        initial_due_date=date.today() - relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    # Create a deleted recurring requirement
    deleted_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Deleted Quarterly Report",
        due_date_period_months=3,
        initial_due_date=date.today() - relativedelta(months=6),
        active_ind=True,
        deleted_ind=True  # Deleted
    )
    
    # Get all recurring requirements
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    recurring_ids = [req.mine_report_permit_requirement_id for req in recurring_requirements]
    
    # Should include only the non-deleted requirement
    assert valid_requirement.mine_report_permit_requirement_id in recurring_ids
    assert deleted_requirement.mine_report_permit_requirement_id not in recurring_ids


def test_mine_report_permit_requirement_get_all_recurring_excludes_requirements_without_initial_due_date(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    # Create a requirement with initial due date
    with_due_date = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Report with Due Date",
        due_date_period_months=6,
        initial_due_date=date.today() - relativedelta(months=3),
        active_ind=True,
        deleted_ind=False
    )
    
    # Create a requirement without initial due date
    without_due_date = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Report without Due Date",
        due_date_period_months=6,
        initial_due_date=None,  # No initial due date
        active_ind=True,
        deleted_ind=False
    )
    
    # Get all recurring requirements
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    recurring_ids = [req.mine_report_permit_requirement_id for req in recurring_requirements]
    
    # Should include only the requirement with initial due date
    assert with_due_date.mine_report_permit_requirement_id in recurring_ids
    assert without_due_date.mine_report_permit_requirement_id not in recurring_ids


def test_mine_report_permit_requirement_get_all_recurring_returns_empty_list_when_no_recurring_requirements(db_session):
    # Don't create any requirements
    
    # Get all recurring requirements
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    
    # Should return empty list
    assert isinstance(recurring_requirements, list)
    assert len(recurring_requirements) == 0


def test_mine_report_permit_requirement_get_all_single_reports(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]

    today = date.today()
    # Create a single-report requirement with initial_due_date in the future
    future_single = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Future One-time Report",
        due_date_period_months=0,
        initial_due_date=today + relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )

    # Create a single-report requirement with initial_due_date in the past
    past_single = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Past One-time Report",
        due_date_period_months=0,
        initial_due_date=today - relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )

    # Create a recurring requirement (should not be included)
    recurring = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Quarterly Report",
        due_date_period_months=3,
        initial_due_date=today - relativedelta(months=3),
        active_ind=True,
        deleted_ind=False
    )

    # Get all single-report requirements with initial_due_date >= today
    single_requirements = MineReportPermitRequirement.get_all_single_reports(today)
    single_ids = [req.mine_report_permit_requirement_id for req in single_requirements]

    # Should include only the future single-report requirement
    assert len(single_ids) == 1
    assert future_single.mine_report_permit_requirement_id in single_ids