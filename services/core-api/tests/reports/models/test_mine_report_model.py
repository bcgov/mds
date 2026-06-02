import pytest
import uuid
from datetime import date
from dateutil.relativedelta import relativedelta
from unittest.mock import patch, MagicMock

from app.api.mines.reports.models.mine_report import MineReport
from tests.factories import (
    MineReportFactory,
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


@patch('app.api.email_tracking.email_status_tasks.send_template_email_task.apply_async')
@patch('app.api.mines.reports.models.mine_report.trigger_notification')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_crr_and_prr_add_notification_email(mock_find_by_name, mock_trigger, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['reports@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    report = MineReportFactory()
    report.mine.major_mine_ind = True
    report.send_crr_and_prr_add_notification_email(is_proponent=False, crr_or_prr='PRR')

    assert mock_apply_async.call_count >= 1
    first_kwargs = mock_apply_async.call_args_list[0][1]['kwargs']
    assert first_kwargs['reference_table'] == 'mine_report'


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_crr_report_update_email_major_mine(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['crr@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    report = MineReportFactory()
    report.mine.major_mine_ind = True
    report.send_crr_report_update_email(is_edit=False)

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['reference_table'] == 'mine_report'
    assert call_kwargs['reference_email_type'] == 'crr_report_update'


@patch('app.api.email_tracking.email_status_tasks.send_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_send_crr_report_update_email_no_dl(mock_find_by_name, mock_apply_async, db_session):
    report = MineReportFactory()
    report.mine.major_mine_ind = True  # skip the region path
    report.send_crr_report_update_email(is_edit=True)

    mock_apply_async.assert_called_once()
    call_kwargs = mock_apply_async.call_args[1]['kwargs']
    assert call_kwargs['distribution_list_guid'] is None