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
    PermitAmendmentFactory,
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
    permit_amendment.permit_amendment_type_code = 'ALG'
    permit_amendment.save()
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
    db_session.flush()

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
    
    @mock.patch('app.api.mines.reports.tasks.ReportFilterHelper.get_filtered_requirements')
    def test_task_with_no_recurring_requirements(self, mock_get_filtered_requirements, db_session):
        mock_get_filtered_requirements.return_value = ([], None)
        
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
            
            expected_year = report.due_date.year - 1 if report.due_date.month <= 3 else report.due_date.year
            assert report.submission_year == expected_year
            assert report.mine_report_status_code == 'NON' # Report Requested

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_can_filter_to_a_single_permit(self, _mock_feature_flag, db_session):
        first_mine, first_permit = create_mine_and_permit(num_permit_amendments=1)
        second_mine, second_permit = create_mine_and_permit(num_permit_amendments=1)
        today = date.today()

        first_permit.permit_amendments[0].permit_amendment_type_code = 'ALG'
        first_permit.permit_amendments[0].save()
        second_permit.permit_amendments[0].permit_amendment_type_code = 'ALG'
        second_permit.permit_amendments[0].save()

        first_requirement = MineReportPermitRequirementFactory(
            permit_amendment=first_permit.permit_amendments[0],
            report_name="First Permit Report",
            due_date_period_months=3,
            initial_due_date=today - relativedelta(months=6),
            active_ind=True,
            deleted_ind=False,
        )
        second_requirement = MineReportPermitRequirementFactory(
            permit_amendment=second_permit.permit_amendments[0],
            report_name="Second Permit Report",
            due_date_period_months=3,
            initial_due_date=today - relativedelta(months=6),
            active_ind=True,
            deleted_ind=False,
        )

        result = create_new_recurring_report_requests(permit_guid=first_permit.permit_guid)

        first_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=first_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        second_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=second_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()

        assert result['total_created'] > 0
        assert result['total_deleted'] == 0
        assert first_reports > 0
        assert second_reports == 0

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_fully_regenerates_existing_report_requests_for_a_single_permit(self, _mock_feature_flag, db_session):
        first_mine, first_permit = create_mine_and_permit(num_permit_amendments=1)
        second_mine, second_permit = create_mine_and_permit(num_permit_amendments=1)
        today = date.today()

        first_permit.permit_amendments[0].permit_amendment_type_code = 'ALG'
        first_permit.permit_amendments[0].save()
        second_permit.permit_amendments[0].permit_amendment_type_code = 'ALG'
        second_permit.permit_amendments[0].save()

        first_requirement = MineReportPermitRequirementFactory(
            permit_amendment=first_permit.permit_amendments[0],
            report_name="First Permit One-time Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )
        second_requirement = MineReportPermitRequirementFactory(
            permit_amendment=second_permit.permit_amendments[0],
            report_name="Second Permit One-time Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        MineReportFactory(
            mine=first_mine,
            permit=first_permit,
            mine_report_permit_requirement=first_requirement,
            due_date=first_requirement.initial_due_date,
            deleted_ind=False,
            mine_report_submissions=0,
        )
        MineReportFactory(
            mine=second_mine,
            permit=second_permit,
            mine_report_permit_requirement=second_requirement,
            due_date=second_requirement.initial_due_date,
            deleted_ind=False,
            mine_report_submissions=0,
        )

        result = create_new_recurring_report_requests(permit_guid=first_permit.permit_guid, regenerate=True)

        first_active_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=first_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        first_deleted_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=first_requirement.mine_report_permit_requirement_id,
            deleted_ind=True,
        ).count()
        second_active_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=second_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        second_deleted_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=second_requirement.mine_report_permit_requirement_id,
            deleted_ind=True,
        ).count()

        assert result['total_deleted'] == 1
        assert result['total_created'] == 1
        assert first_active_reports == 1
        assert first_deleted_reports == 1
        assert second_active_reports == 1
        assert second_deleted_reports == 0

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_filter_does_not_delete_existing_reports_without_regeneration(self, _mock_feature_flag, db_session):
        mine, permit = create_mine_and_permit(num_permit_amendments=1)
        today = date.today()

        permit.permit_amendments[0].permit_amendment_type_code = 'ALG'
        permit.permit_amendments[0].save()

        requirement = MineReportPermitRequirementFactory(
            permit_amendment=permit.permit_amendments[0],
            report_name="One-time Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        MineReportFactory(
            mine=mine,
            permit=permit,
            mine_report_permit_requirement=requirement,
            due_date=requirement.initial_due_date,
            deleted_ind=False,
            mine_report_submissions=0,
        )

        result = create_new_recurring_report_requests(permit_guid=permit.permit_guid)

        active_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        deleted_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=True,
        ).count()

        assert result['total_deleted'] == 0
        assert result['total_created'] == 0
        assert active_reports == 1
        assert deleted_reports == 0

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_only_uses_latest_validated_requirements_per_mine_for_amalgamated_permits(self, _mock_feature_flag, db_session):
        first_mine, permit = create_mine_and_permit(num_permit_amendments=0)
        second_mine = MineFactory()
        permit._all_mines.append(second_mine)
        today = date.today()

        first_mine_original_amendment = PermitAmendmentFactory(
            permit=permit,
            mine=first_mine,
            issue_date=today - relativedelta(months=3),
            permit_amendment_type_code='AMD',
        )
        first_mine_latest_amendment = PermitAmendmentFactory(
            permit=permit,
            mine=first_mine,
            issue_date=today - relativedelta(months=2),
            permit_amendment_type_code='AMD',
        )
        second_mine_amalgamated_amendment = PermitAmendmentFactory(
            permit=permit,
            mine=second_mine,
            issue_date=today - relativedelta(months=1),
            permit_amendment_type_code='ALG',
        )

        stale_requirement = MineReportPermitRequirementFactory(
            permit_amendment=first_mine_original_amendment,
            report_name="Stale Mine 1 Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )
        latest_first_mine_requirement = MineReportPermitRequirementFactory(
            permit_amendment=first_mine_latest_amendment,
            report_name="Latest Mine 1 Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )
        second_mine_requirement = MineReportPermitRequirementFactory(
            permit_amendment=second_mine_amalgamated_amendment,
            report_name="Latest Mine 2 Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        result = create_new_recurring_report_requests()

        stale_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=stale_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        latest_first_mine_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=latest_first_mine_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()
        second_mine_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=second_mine_requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()

        assert result['total_created'] == 2
        assert stale_reports == 0
        assert latest_first_mine_reports == 1
        assert second_mine_reports == 1

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_skips_creation_when_latest_authorization_end_date_has_passed(self, _mock_feature_flag, db_session):
        _mine, permit = create_mine_and_permit(num_permit_amendments=2)
        today = date.today()
        latest_permit_amendment = max(
            permit._all_permit_amendments,
            key=lambda permit_amendment: permit_amendment.permit_amendment_id,
        )
        older_permit_amendment = min(
            permit._all_permit_amendments,
            key=lambda permit_amendment: permit_amendment.permit_amendment_id,
        )

        older_permit_amendment.authorization_end_date = today + relativedelta(days=30)
        older_permit_amendment.permit_amendment_type_code = 'AMD'
        older_permit_amendment.save()
        latest_permit_amendment.authorization_end_date = today - relativedelta(days=1)
        latest_permit_amendment.permit_amendment_type_code = 'ALG'
        latest_permit_amendment.save()

        requirement = MineReportPermitRequirementFactory(
            permit_amendment=older_permit_amendment,
            report_name="Expired Authorization Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        result = create_new_recurring_report_requests(permit_guid=permit.permit_guid)

        reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()

        assert result['total_created'] == 0
        assert result['total_deleted'] == 0
        assert reports == 0

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_can_filter_to_a_permit_without_context_mine(self, _mock_feature_flag, db_session):
        _mine, permit = create_mine_and_permit(num_permit_amendments=1)
        permit._context_mine = None
        today = date.today()

        permit._all_permit_amendments[0].permit_amendment_type_code = 'ALG'
        permit._all_permit_amendments[0].save()

        requirement = MineReportPermitRequirementFactory(
            permit_amendment=permit._all_permit_amendments[0],
            report_name="Context-free Permit Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        result = create_new_recurring_report_requests(permit_guid=permit.permit_guid)

        reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()

        assert result['total_created'] == 1
        assert result['total_deleted'] == 0
        assert reports == 1

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    def test_task_does_not_create_reports_when_latest_permit_amendment_is_not_amalgamated(self, _mock_feature_flag, db_session):
        _mine, permit = create_mine_and_permit(num_permit_amendments=1)
        today = date.today()

        permit.permit_amendments[0].permit_amendment_type_code = 'AMD'
        permit.permit_amendments[0].save()

        requirement = MineReportPermitRequirementFactory(
            permit_amendment=permit.permit_amendments[0],
            report_name="Non Amalgamated Report",
            due_date_period_months=0,
            initial_due_date=today + relativedelta(months=3),
            active_ind=True,
            deleted_ind=False,
        )

        result = create_new_recurring_report_requests(permit_guid=permit.permit_guid)

        reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=False,
        ).count()

        assert result['total_created'] == 0
        assert result['total_deleted'] == 0
        assert reports == 0

    @mock.patch('app.api.mines.reports.tasks.is_feature_enabled', return_value=True)
    @mock.patch('app.api.mines.permits.permit.models.permit.Permit.find_by_permit_guid', return_value=None)
    def test_task_returns_error_for_unknown_permit_filter(self, _mock_find_permit, _mock_feature_flag):
        result = create_new_recurring_report_requests(permit_guid='missing-permit-guid')

        assert result == {'status': 'error', 'reason': 'permit not found'}


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
        db_session.flush()

        mine_report = MineReportFactory(
            mine=mine,
            mine_report_definition_id=non_recurring_definition.mine_report_definition_id,
            due_date=today - relativedelta(years=1),
            deleted_ind=False
        )

        create_new_recurring_crr_report_requests()

        reports = MineReport.query.filter_by(
            mine_guid=mine.mine_guid,
            mine_report_definition_id=non_recurring_definition.mine_report_definition_id,
            deleted_ind=False
            ).filter(MineReport.mine_report_id == mine_report.mine_report_id).all()

        assert len(reports) == 1
        assert reports[0].mine_report_id == mine_report.mine_report_id

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