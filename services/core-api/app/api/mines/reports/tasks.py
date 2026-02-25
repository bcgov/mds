from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.mine.models.mine import Mine
from app.extensions import db
from app.tasks.celery import celery
from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.api.utils.feature_flag import Feature, is_feature_enabled
from collections import defaultdict

def _calculate_missing_due_dates(requirement, existing_due_dates, current_date, one_year_from_now):
    """Calculate which due dates need new reports created."""
    missing_due_dates = []

    # Single-report (non-recurring) requirements: return the initial due date
    # only if it's strictly in the future and within the one-year horizon.
    if requirement.due_date_period_months <= 0:
        initial = requirement.initial_due_date
        if initial <= one_year_from_now and initial not in existing_due_dates:
            missing_due_dates.append(initial)
        return missing_due_dates

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
    while next_due_date <= one_year_from_now:
        if next_due_date not in existing_due_dates:
            missing_due_dates.append(next_due_date)
        next_due_date = next_due_date + relativedelta(months=requirement.due_date_period_months)

    return missing_due_dates

def _calculate_missing_crr_report_due_dates(mine_report_due_date_type, existing_due_dates, current_date, one_year_from_now):
    missing_due_dates = []
    latest_existing_due_date= max(existing_due_dates) if existing_due_dates else None

    if latest_existing_due_date:
        if mine_report_due_date_type == "YRL":
            next_due_date = current_date.replace(month=1,day=31)
        elif mine_report_due_date_type == "FIS":
            next_due_date = current_date.replace(month=3, day=31)
    else:
        return missing_due_dates

    # Roll forward a year if next due date is in the past
    if next_due_date < current_date:
        next_due_date += relativedelta(years=1)

    if next_due_date not in existing_due_dates:
        missing_due_dates.append(next_due_date)

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
    
    existing_due_dates = set()
    for report in existing_reports:
        dd = report.due_date
        if isinstance(dd, datetime):
            dd = dd.date()
        existing_due_dates.add(dd)
    
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

def _process_crr_reports(mine, mine_report_definition, reports, current_date, one_year_from_now):
    """Process a mine's existing crr reports of the given mine report definition type and create any missing reports"""

    print(f"Processing {mine_report_definition.report_name} reports for the mine: {mine.mine_name}")
    
    existing_due_dates = set()
    for report in reports:
        dd = report.due_date
        if isinstance(dd, datetime):
            dd = dd.date()
        existing_due_dates.add(dd)
    
    missing_due_dates = _calculate_missing_crr_report_due_dates(
        mine_report_definition.mine_report_due_date_type, existing_due_dates, current_date, one_year_from_now
    )

    print(f"  Need to create {len(missing_due_dates)} new CRR reports")

    # Create missing reports
    created_count = 0
    failed_count = 0

    for due_date in missing_due_dates:
        try:
            new_mine_report = MineReport.create(
                mine_report_definition_id=mine_report_definition.mine_report_definition_id,
                mine_guid=mine.mine_guid,
                due_date=due_date,  # Use the passed-in due date
                received_date=None, # Not received yet
                submission_year=None,  # Will be set when submitted
                description_comment=None,  # Will be set when submitted
                submitter_name="",  # Will be set when submitted
                permit_id=None,     # CRR reports don't use this
                permit_condition_category_code=None,
                mine_report_permit_requirement_id=None, #CRR reports don't use this
                submitter_email="",  # Will be set when submitted
                add_to_session=True,
                system_created=True
            )

            new_mine_report.submission_year = due_date.year
            new_mine_report.save()
            db.session.commit()

            created_count += 1
            print(f"    Created report due {due_date}")
        except Exception as e:
            print(f"    Error creating report for due date {due_date}: {str(e)}")
            db.session.rollback()
            failed_count += 1
    
    print(f"  Successfully created {created_count} {mine_report_definition.report_name} reports for this mine")
    return created_count, failed_count

@celery.task()
def create_new_recurring_report_requests():
    """
    Create new recurring report requests based on permit requirements.
    This task finds all recurring requirements and creates missing reports
    for the next year, ensuring no duplicates are created.
    """
    if not is_feature_enabled(Feature.RECURRING_REPORTS):
        print("Task exiting early - feature flag is disabled")
        return {"status": "skipped", "reason": "feature flag disabled"} 
    
    current_date = datetime.now().date()
    
    recurring_requirements = MineReportPermitRequirement.get_all_recurring()
    print(f"Found {len(recurring_requirements)} recurring report requirements")
    single_requirements = MineReportPermitRequirement.get_all_single_reports(current_date)
    print(f"Found {len(single_requirements)} single report requirements")

    all_requirements = recurring_requirements + single_requirements
    
    one_year_from_now = current_date + relativedelta(years=1)
    
    total_created = 0
    failed_requirements = []
    
    for requirement in all_requirements:
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

@celery.task()
def create_new_recurring_crr_report_requests():
    """
    Create new recurring report requests based on existing CRR reports.
    This task finds all recurring CRR reports and creates missing reports
    for the next year, ensuring no duplicates are created.
    """
    if not is_feature_enabled(Feature.RECURRING_REPORTS):
        print("Task exiting early - feature flag is disabled")
        return {"status": "skipped", "reason": "feature flag disabled"} 
    
    current_date = datetime.now().date()
    one_year_from_now = current_date + relativedelta(years=1)

    recurring_reports = MineReport.get_all_recurring_crr_reports()
    print(f"Found {len(recurring_reports)} recurring CRR reports")

    # Group reports by mine then by mine report definition ID 
    grouped_recurring_reports = defaultdict(lambda: defaultdict(list))
    for report in recurring_reports:
        grouped_recurring_reports[report.mine_guid][report.mine_report_definition_id].append(report)
    
    total_created = 0
    failed_report_requests= []

    for mine_guid, mine_report_definitions in grouped_recurring_reports.items():
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            print(f"No mine found for mine guid: {mine_guid}")
            continue
        for mine_report_definition_id, reports in mine_report_definitions.items():    
            mine_report_definition = MineReportDefinition.find_by_mine_report_definition_id(mine_report_definition_id)
            if not mine_report_definition:
                print(f"No MineReportDefinition found for id: {mine_report_definition_id}")
                continue

            created_count, failed_count = _process_crr_reports(
            mine, mine_report_definition, reports, current_date, one_year_from_now
            )
            
            total_created += created_count
        
            if failed_count > 0:
                failed_report_requests.append({
                    'mine_name': mine.mine_name,
                    'mine_report_definition_report_name': mine_report_definition.report_name,
                    'failed_count': failed_count
                })

    print(f"\nCompleted! Total CRR reports created: {total_created}")
    
    if failed_report_requests:
        print("\nWarning: Some report requests had failures:")
        for failed in failed_report_requests:
            print(f"  - Mine Report of definition ({failed['mine_report_definition_report_name']}) belonging to the mine {failed['mine_name']}: {failed['failed_count']} failed reports")
    
    return {
        'total_created': total_created,
        'failed_report_requests': failed_report_requests
    }