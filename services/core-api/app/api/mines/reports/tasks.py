from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.reports.models.mine_report import MineReport
from app.extensions import db
from app.tasks.celery import celery
from datetime import datetime
from dateutil.relativedelta import relativedelta


@celery.task()
def create_new_recurring_report_requests():
    """
    Create new recurring report requests based on permit requirements.
    This task finds all recurring requirements and creates missing reports
    for the next year, ensuring no duplicates are created.
    """
    print("Starting creation of recurring report requests...")
    
    # Get all recurring requirements
    requirements = MineReportPermitRequirement.get_all_recurring()
    print(f"Found {len(requirements)} recurring report requirements")
    
    total_created = 0
    failed_requirements = []
    
    for requirement in requirements:
        print(f"Processing requirement: {requirement.report_name} (ID: {requirement.mine_report_permit_requirement_id})")
        
        # Skip if no initial due date (should not happen due to our query filter)
        if not requirement.initial_due_date:
            print(f"  Skipping - no initial due date")
            continue
        
        # Get existing reports for this requirement
        existing_reports = MineReport.query.filter_by(
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            deleted_ind=False
        ).all()
        
        print(f"  Found {len(existing_reports)} existing reports")
        
        # Calculate due dates for the next year starting from initial_due_date
        current_date = datetime.now().date()
        one_year_from_now = current_date + relativedelta(years=1)
        
        existing_due_dates = {report.due_date.date() for report in existing_reports}
        latest_existing_due_date = max(existing_due_dates) if existing_due_dates else None
        
        # Start from the appropriate date and advance to first future date
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
        
        print(f"  Need to create {len(missing_due_dates)} new reports")
        
        # Create missing reports
        created_count = 0
        failed_count = 0
        for due_date in missing_due_dates:
            try:
                mine_report = MineReport.create_from_permit_report_requirement(requirement, due_date)
                mine_report.submission_year = due_date.year
                mine_report.save()
                db.session.commit()
                created_count += 1
                print(f"    Created report due {due_date}")
            except Exception as e:
                print(f"    Error creating report for due date {due_date}: {str(e)}")
                db.session.rollback()
                failed_count += 1
        
        if failed_count > 0:
            failed_requirements.append({
                'requirement_id': requirement.mine_report_permit_requirement_id,
                'report_name': requirement.report_name,
                'failed_count': failed_count
            })
        
        total_created += created_count
        print(f"  Successfully created {created_count} reports for this requirement")
    
    print(f"\nCompleted! Total reports created: {total_created}")
    
    if failed_requirements:
        print(f"\nWarning: Some requirements had failures:")
        for failed in failed_requirements:
            print(f"  - Requirement ID {failed['requirement_id']} ({failed['report_name']}): {failed['failed_count']} failed reports")
    
    return {
        'total_created': total_created,
        'failed_requirements': failed_requirements
    }