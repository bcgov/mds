from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.reports.models.mine_report import MineReport
from app.extensions import db
from app.tasks.celery import celery
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.api.utils.feature_flag import Feature, is_feature_enabled


def _calculate_missing_due_dates(requirement, existing_due_dates, current_date, one_year_from_now):
    """Calculate which due dates need new reports created."""
    latest_existing_due_date = max(existing_due_dates) if existing_due_dates else None
    
    # Start from the appropriate date
    if latest_existing_due_date:
        next_due_date = latest_existing_due_date + relativedelta(months=requirement.due_date_period_months)
    else:
        next_due_date = requirement.initial_due_date
    
    # Advance to the first future date
    while next_due_date <= current_date:
        next_due_date = next_due_date + relativedelta(months=requirement.due_date_period_months)
    
    # Collect all future dates within the one-year horizon
    missing_due_dates = []
    while next_due_date <= one_year_from_now:
        if next_due_date not in existing_due_dates:
            missing_due_dates.append(next_due_date)
        next_due_date = next_due_date + relativedelta(months=requirement.due_date_period_months)
    
    return missing_due_dates


def _create_report_for_due_date(requirement, due_date):
    """Create a single mine report for the given due date."""
    mine_report = MineReport.create_from_permit_report_requirement(requirement, due_date)
    mine_report.submission_year = due_date.year
    mine_report.save()
    db.session.commit()
    return mine_report


def _process_single_requirement(requirement, current_date, one_year_from_now):
    """Process a single requirement and create missing reports."""
    print(f"Processing requirement: {requirement.report_name} (ID: {requirement.mine_report_permit_requirement_id})")
    
    if not requirement.initial_due_date:
        print("  Skipping - no initial due date")
        return 0, 0
    
    # Get existing reports
    existing_reports = MineReport.query.filter_by(
        mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
        deleted_ind=False
    ).all()
    
    print(f"  Found {len(existing_reports)} existing reports")
    
    existing_due_dates = {report.due_date.date() for report in existing_reports}
    missing_due_dates = _calculate_missing_due_dates(
        requirement, existing_due_dates, current_date, one_year_from_now
    )
    
    print(f"  Need to create {len(missing_due_dates)} new reports")
    
    # Create missing reports
    created_count = 0
    failed_count = 0
    for due_date in missing_due_dates:
        try:
            _create_report_for_due_date(requirement, due_date)
            created_count += 1
            print(f"    Created report due {due_date}")
        except Exception as e:
            print(f"    Error creating report for due date {due_date}: {str(e)}")
            db.session.rollback()
            failed_count += 1
    
    print(f"  Successfully created {created_count} reports for this requirement")
    return created_count, failed_count


@celery.task()
def create_new_recurring_report_requests():
    """
    Create new recurring report requests based on permit requirements.
    This task finds all recurring requirements and creates missing reports
    for the next year, ensuring no duplicates are created.
    """
    if not is_feature_enabled(Feature.RECURRING_REPORTS):
        return
    
    print("Starting creation of recurring report requests...")
    
    requirements = MineReportPermitRequirement.get_all_recurring()
    print(f"Found {len(requirements)} recurring report requirements")
    
    current_date = datetime.now().date()
    one_year_from_now = current_date + relativedelta(years=1)
    
    total_created = 0
    failed_requirements = []
    
    for requirement in requirements:
        created_count, failed_count = _process_single_requirement(
            requirement, current_date, one_year_from_now
        )
        
        total_created += created_count
        
        if failed_count > 0:
            failed_requirements.append({
                'requirement_id': requirement.mine_report_permit_requirement_id,
                'report_name': requirement.report_name,
                'failed_count': failed_count
            })
    
    print(f"\nCompleted! Total reports created: {total_created}")
    
    if failed_requirements:
        print("\nWarning: Some requirements had failures:")
        for failed in failed_requirements:
            print(f"  - Requirement ID {failed['requirement_id']} ({failed['report_name']}): {failed['failed_count']} failed reports")
    
    return {
        'total_created': total_created,
        'failed_requirements': failed_requirements
    }