import pytest
from datetime import date
from dateutil.relativedelta import relativedelta

from app.api.mines.reports.models.mine_report import MineReport
from tests.factories import (
    MineReportPermitRequirementFactory,
    create_mine_and_permit
)


def test_mine_report_create_from_permit_report_requirement_creates_correct_attributes(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    # Create a permit requirement
    requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Test Environmental Report",
        due_date_period_months=6,
        initial_due_date=date.today() - relativedelta(months=3),
        active_ind=True,
        deleted_ind=False
    )
    
    # Test creating a report from the requirement
    due_date = date.today() + relativedelta(months=3)
    mine_report = MineReport.create_from_permit_report_requirement(requirement, due_date)
    
    # Verify the report was created correctly
    assert mine_report is not None
    assert mine_report.mine_guid == mine.mine_guid
    assert mine_report.permit_id == permit.permit_id
    assert mine_report.due_date == due_date
    assert mine_report.mine_report_permit_requirement_id == requirement.mine_report_permit_requirement_id
    assert mine_report.received_date is None
    assert mine_report.submission_year is None
    assert mine_report.submitter_name == ""
    assert mine_report.submitter_email == ""
    assert mine_report.created_by_idir == 'system'
    assert mine_report.mine_report_definition_id is None
    assert mine_report.permit_condition_category_code is None
    assert mine_report.mine_report_status_code == 'NON'

def test_mine_report_create_from_permit_report_requirement_handles_date_objects_correctly(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Date Test Report",
        due_date_period_months=12,
        initial_due_date=date.today(),
        active_ind=True,
        deleted_ind=False
    )
    
    # Test with a date object
    test_due_date = date(2026, 6, 15)
    mine_report = MineReport.create_from_permit_report_requirement(requirement, test_due_date)
    
    assert mine_report.due_date == test_due_date


def test_mine_report_create_from_permit_report_requirement_sets_system_creation_flags(db_session):
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    
    requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="System Flag Test Report",
        due_date_period_months=3,
        initial_due_date=date.today(),
        active_ind=True,
        deleted_ind=False
    )
    
    due_date = date.today() + relativedelta(months=6)
    mine_report = MineReport.create_from_permit_report_requirement(requirement, due_date)
    
    # Verify system creation flags
    assert mine_report.created_by_idir == 'system'
    assert mine_report.create_user == 'system'
    assert mine_report.update_user == 'system'
    
    # Verify it's added to session by default
    assert mine_report in db_session.new