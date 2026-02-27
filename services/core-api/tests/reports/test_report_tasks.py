import pytest
from unittest import mock
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

from app.api.mines.reports.tasks import create_new_recurring_report_requests
from app.api.mines.reports.tasks import create_new_recurring_crr_report_requests
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from tests.factories import (
    MineReportPermitRequirementFactory,
    MineReportFactory,
    create_mine_and_permit,
    MineFactory,
    ComplianceArticleFactory,
    MineReportDefinitionComplianceArticleXrefFactory,
)

@pytest.fixture(scope="function")
def db_session(db_session):
    # Fixes "Instance is not bound to a session" error with celery/pytest/flask combination
    # https://github.com/jeancochrane/pytest-flask-sqlalchemy/issues/27
    with mock.patch.object(db_session, "remove", lambda: None):
        yield db_session


@pytest.fixture
def setup_recurring_requirements(db_session):
    """Set up test data with a mine, permit, and recurring report requirements."""
    mine, permit = create_mine_and_permit(num_permit_amendments=1)
    permit_amendment = permit.permit_amendments[0]
    today = date.today()
    
    quarterly_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Quarterly Environmental Report",
        due_date_period_months=3,
        initial_due_date=today - relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    annual_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="Annual Safety Report",
        due_date_period_months=12,
        initial_due_date=today - relativedelta(months=3),
        active_ind=True,
        deleted_ind=False
    )
    
    non_recurring_requirement = MineReportPermitRequirementFactory(
        permit_amendment=permit_amendment,
        report_name="One-time Report",
        due_date_period_months=0,
        initial_due_date=today + relativedelta(months=6),
        active_ind=True,
        deleted_ind=False
    )
    
    yield {
        'mine': mine,
        'permit': permit,
        'permit_amendment': permit_amendment,
        'quarterly_requirement': quarterly_requirement,
        'annual_requirement': annual_requirement,
        'non_recurring_requirement': non_recurring_requirement
    }


@pytest.fixture
def setup_crr_environment(request, db_session):
    today = date.today()

    mine = MineFactory()


    mine_report_definition = MineReportDefinition(
        report_name="CRR Report",
        active_ind=True,
        mine_report_due_date_type="FIS",
        description="CRR definition",
        is_common=True,
        is_prr_only=False,
    )

    db_session.add(mine_report_definition)
    db_session.commit()

    article = ComplianceArticleFactory(
        expiry_date=datetime.utcnow() + relativedelta(months=12)
    )

    MineReportDefinitionComplianceArticleXrefFactory(
        mine_report_definition_id=mine_report_definition.mine_report_definition_id,
        compliance_article_id=article.compliance_article_id,
    )

    yield {
        "mine": mine,
        "definition": mine_report_definition,
        "today": today,
        "due_type": "FIS",
        "expected_month": 3,
        "expected_day": 31
    }

@pytest.fixture
def setup_with_existing_reports(setup_recurring_requirements):
    data = setup_recurring_requirements
    quarterly_req = data['quarterly_requirement']
    today = date.today()
    
    # Create existing reports for the quarterly requirement
    MineReportFactory(
        mine=data['mine'],
        permit=data['permit'],
        mine_report_permit_requirement=quarterly_req,
        due_date=today - relativedelta(months=3),
        submission_year=(today - relativedelta(months=3)).year,
        deleted_ind=False
    )
    
    MineReportFactory(
        mine=data['mine'],
        permit=data['permit'],
        mine_report_permit_requirement=quarterly_req,
        due_date=today,
        submission_year=today.year,
        deleted_ind=False
    )
    
    yield data


# PRR report tests
class TestCreateNewRecurringReportRequests:
    
    def test_task_creates_missing_reports_for_next_year(self, setup_recurring_requirements):
        today = date.today()
        quarterly_req = setup_recurring_requirements['quarterly_requirement']
        annual_req = setup_recurring_requirements['annual_requirement']
        
        # Set initial due dates in the past to trigger future report creation
        quarterly_req.initial_due_date = today - relativedelta(months=6)
        quarterly_req.save()
        annual_req.initial_due_date = today - relativedelta(months=3)
        annual_req.save()
        
        result = create_new_recurring_report_requests()
        
        assert result['total_created'] > 0
        assert len(result['failed_requirements']) == 0
        
        # Verify reports were created for both requirements
        quarterly_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        annual_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=annual_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        assert quarterly_count > 0
        assert annual_count > 0
    
    def test_task_integration_with_real_data(self, setup_recurring_requirements):
        today = date.today()
        quarterly_req = setup_recurring_requirements['quarterly_requirement']
        
        quarterly_req.initial_due_date = today - relativedelta(months=4)
        quarterly_req.save()
        
        result = create_new_recurring_report_requests()
        
        assert result['total_created'] > 0
        assert len(result['failed_requirements']) == 0
        
        reports_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        assert reports_count > 0
    
    def test_task_respects_existing_reports(self, setup_with_existing_reports):
        today = date.today()
        quarterly_req = setup_with_existing_reports['quarterly_requirement']
        
        # Set initial date far in the past to ensure future reports are needed
        quarterly_req.initial_due_date = today - relativedelta(months=15)
        quarterly_req.save()
        
        # Clear existing reports and create a controlled test scenario
        MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id
        ).delete()
        
        # Create an existing report that will require future reports
        existing_report_date = today - relativedelta(months=9, days=10)  
        report1 = MineReport.create_from_permit_report_requirement(quarterly_req, existing_report_date)
        
        # Verify the existing report due date for debugging
        report1_due_date = report1.due_date
        if isinstance(report1_due_date, datetime):
            report1_due_date = report1_due_date.date()
        
        initial_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        assert initial_count == 1
        
        result = create_new_recurring_report_requests()
        
        final_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        assert final_count > initial_count, f"Expected more than {initial_count} reports, got {final_count}"

        # Verify no duplicate due dates
        all_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).all()
        
        due_dates = [r.due_date.date() for r in all_reports]
        unique_due_dates = set(due_dates)
        assert len(due_dates) == len(unique_due_dates), f"Found duplicate due dates: {due_dates}"
    
    def test_task_ignores_non_recurring_requirements(self, setup_recurring_requirements):
        today = date.today()
        non_recurring_req = setup_recurring_requirements['non_recurring_requirement']
        
        non_recurring_req.initial_due_date = today - relativedelta(months=2)
        non_recurring_req.save()
        
        result = create_new_recurring_report_requests()
        
        # Should not create reports for non-recurring requirements
        non_recurring_count = MineReport.query.filter_by(
            mine_report_permit_requirement_id=non_recurring_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).count()
        
        assert non_recurring_count == 0
    
    def test_task_handles_missing_permit_amendment_gracefully(self, setup_recurring_requirements):
        # Test error handling by mocking create_from_permit_report_requirement to fail
        with mock.patch('app.api.mines.reports.models.mine_report.MineReport.create_from_permit_report_requirement') as mock_create:
            mock_create.side_effect = [Exception("Simulated failure"), mock.DEFAULT]
            
            result = create_new_recurring_report_requests()
            
            assert 'total_created' in result
            assert 'failed_requirements' in result
            assert len(result['failed_requirements']) >= 0
    
    def test_task_only_creates_future_reports(self, setup_recurring_requirements):
        today = date.today()
        quarterly_req = setup_recurring_requirements['quarterly_requirement']
        annual_req = setup_recurring_requirements['annual_requirement']
        
        quarterly_req.initial_due_date = today - relativedelta(months=8)
        quarterly_req.save()
        annual_req.initial_due_date = today - relativedelta(months=6)
        annual_req.save()
        
        result = create_new_recurring_report_requests()
        
        # All created reports should have future due dates
        all_reports = MineReport.query.filter(
            MineReport.mine_report_permit_requirement_id.in_([
                quarterly_req.mine_report_permit_requirement_id,
                annual_req.mine_report_permit_requirement_id
            ]),
            MineReport.deleted_ind == False
        ).all()
        
        for report in all_reports:
            report_due_date = report.due_date.date()
            assert report_due_date > today, f"Report due date {report_due_date} should be after {today}"
    
    def test_task_respects_one_year_horizon(self, setup_recurring_requirements):
        today = date.today()
        quarterly_req = setup_recurring_requirements['quarterly_requirement']
        annual_req = setup_recurring_requirements['annual_requirement']
        
        # Set initial dates far in the past to generate multiple future reports
        quarterly_req.initial_due_date = today - relativedelta(months=15)
        quarterly_req.save()
        annual_req.initial_due_date = today - relativedelta(months=15)
        annual_req.save()
        
        result = create_new_recurring_report_requests()
        
        # No reports should have due dates beyond one year from today
        all_reports = MineReport.query.filter(
            MineReport.mine_report_permit_requirement_id.in_([
                quarterly_req.mine_report_permit_requirement_id,
                annual_req.mine_report_permit_requirement_id
            ]),
            MineReport.deleted_ind == False
        ).all()
        
        max_date = today + relativedelta(years=1)
        for report in all_reports:
            report_due_date = report.due_date.date()
            assert report_due_date <= max_date, f"Report due date {report_due_date} should not be after {max_date}"
    
    @mock.patch('app.api.mines.reports.tasks.MineReportPermitRequirement.get_all_recurring')
    def test_task_with_no_recurring_requirements(self, mock_get_all_recurring, db_session):
        mock_get_all_recurring.return_value = []
        
        result = create_new_recurring_report_requests()
        
        assert result['total_created'] == 0
        assert len(result['failed_requirements']) == 0
    
    def test_task_creates_single_report_for_future_non_recurring_requirement(self, setup_recurring_requirements, db_session):
        # Should create exactly one report for a non-recurring requirement with a future initial_due_date
        today = date.today()
        non_recurring_req = setup_recurring_requirements['non_recurring_requirement']
        non_recurring_req.initial_due_date = today + relativedelta(months=3)
        non_recurring_req.save()

        result = create_new_recurring_report_requests()

        reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=non_recurring_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).all()
        assert len(reports) == 1
        assert reports[0].due_date.date() == non_recurring_req.initial_due_date

    def test_task_creates_reports_with_correct_attributes(self, setup_recurring_requirements):
        today = date.today()
        quarterly_req = setup_recurring_requirements['quarterly_requirement']
        quarterly_req.initial_due_date = today - relativedelta(months=6)
        quarterly_req.save()

        result = create_new_recurring_report_requests()

        reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=quarterly_req.mine_report_permit_requirement_id,
            deleted_ind=False
        ).all()

        # All reports should be system-created with appropriate defaults
        for report in reports:
            assert report.created_by_idir == 'system'
            assert report.submitter_name == ""
            assert report.submitter_email == ""
            assert report.received_date is None
            assert report.submission_year == report.due_date.year
            assert report.mine_report_status_code == 'NON' # Report Requested


# CRR report test
class TestCreateNewRecurringCRRReportRequests:

    def test_creates_missing_recurring_crr_reports(self, setup_crr_environment):
        data = setup_crr_environment
        mine = data["mine"]
        definition = data["definition"]
        today = data["today"]

        existing_due = today - relativedelta(months=6)

        MineReportFactory(
            mine=mine,
            mine_report_definition_id=definition.mine_report_definition_id,
            due_date=existing_due,
            deleted_ind=False
        )

        result = create_new_recurring_crr_report_requests()

        assert int(result["total_created"]) > 0
        assert len(result["failed_report_requests"]) == 0

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=definition.mine_report_definition_id,
            deleted_ind=False
        ).all()

        assert len(reports) > 1

    def test_created_reports_have_correct_fixed_day_and_month_for_due_dates(self, setup_crr_environment):
        data = setup_crr_environment
        mine = data["mine"]
        definition = data["definition"]
        today = data["today"]
        expected_month = data["expected_month"]
        expected_day = data["expected_day"]

        create_new_recurring_crr_report_requests()

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=definition.mine_report_definition_id,
            deleted_ind=False
        ).all()

        # Assert all reports have the correct fixed day/month
        for report in reports:
            due_date = report.due_date.date()
            assert due_date.month == expected_month
            assert due_date.day == expected_day
            assert due_date > today

    def test_no_duplicate_due_dates(self, setup_crr_environment):
        data = setup_crr_environment
        mine = data["mine"]
        definition = data["definition"]
        today = data["today"]
        expected_month = data["expected_month"]
        expected_day = data["expected_day"]

        last_year = today.year - 1

        existing_due_date = date(last_year, expected_month, expected_day)

        MineReportFactory(
            mine=mine,
            mine_report_definition_id=definition.mine_report_definition_id,
            due_date=existing_due_date,
            deleted_ind=False
        )

        create_new_recurring_crr_report_requests()

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=definition.mine_report_definition_id,
            deleted_ind=False
        ).all()

        due_dates = [r.due_date.date() for r in reports]

        assert len(due_dates) == len(set(due_dates))

    def test_task_ignores_non_recurring_mine_report_due_date_types(self, db_session):
        today = date.today()

        mine = MineFactory()

        non_recurring_definition = MineReportDefinition(
            report_name="Non Recurring Report",
            active_ind=True,
            mine_report_due_date_type="EVT",
            description=f"CRR test definition",
            is_common=True,
            is_prr_only=False,
        )

        db_session.add(non_recurring_definition)
        db_session.commit()

        mine_report = MineReportFactory(
            mine=mine,
            mine_report_definition_id=non_recurring_definition.mine_report_definition_id,
            due_date=today - relativedelta(years=1),
            deleted_ind=False
        )

        result = create_new_recurring_crr_report_requests()

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=non_recurring_definition.mine_report_definition_id,
            deleted_ind=False
            ).filter(MineReport.mine_report_id == mine_report.mine_report_id).all()

        assert len(reports) == 1
        assert result["total_created"] == 0

    @mock.patch("app.api.mines.reports.models.mine_report.MineReport.create")
    @mock.patch("app.api.mines.reports.tasks.Mine.find_by_mine_guid")
    @mock.patch("app.api.mines.reports.tasks.MineReportDefinition.find_by_mine_report_definition_id")
    def test_task_handles_creation_failure(self, mock_definition, mock_mine, mock_create, setup_crr_environment):
        mock_create.side_effect = Exception("Simulated failure")

        mock_mine.return_value = mock.Mock(mine_name="Test Mine", mine_guid="fake-guid")
        mock_definition.return_value = mock.Mock(report_name="Test CRR Report", mine_report_definition_id="fake-id", mine_report_due_date_type="FIS")

        result = create_new_recurring_crr_report_requests()

        assert "total_created" in result
        assert "failed_report_requests" in result
        assert len(result['failed_report_requests']) >= 0

    def test_respects_one_year_horizon(self, setup_crr_environment):
        data = setup_crr_environment
        mine = data["mine"]
        definition = data["definition"]
        today = data["today"]
        expected_month = data["expected_month"]
        expected_day = data["expected_day"]

        last_year = today.year - 1
        existing_due_date = date(last_year, expected_month, expected_day)

        MineReportFactory(
            mine=mine,
            mine_report_definition_id=definition.mine_report_definition_id,
            due_date=existing_due_date,
            deleted_ind=False
        )

        create_new_recurring_crr_report_requests()

        max_allowed_date = today + relativedelta(years=1)

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=definition.mine_report_definition_id,
            deleted_ind=False
        ).all()

        for report in reports:
            due_date = report.due_date.date()

            assert due_date.month == expected_month
            assert due_date.day == expected_day

            assert due_date <= max_allowed_date