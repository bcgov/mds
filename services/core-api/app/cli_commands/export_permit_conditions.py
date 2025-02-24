import csv
import datetime
import os

from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.extensions import db


def export_permit_conditions(permit_amendment_guid, csv_writer=None):
    """
    Export permit conditions for the specified permit amendment.
    If csv_writer is provided, writes to that instead of creating a new file.
    Returns a list of condition rows if csv_writer is provided, otherwise returns filename.
    """
    amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

    if amendment is None:
        print(f'Permit amendment with guid {permit_amendment_guid} not found.')
        return

    # Get all conditions in hierarchical order
    conditions = PermitConditions.find_by_permit_amendment_id_ordered(amendment.permit_amendment_id)
    
    if not conditions:
        print(f'No conditions found for permit amendment {permit_amendment_guid}')
        return
    
    mine = amendment.mine
    if not mine:
        print(f'Permit amendment {permit_amendment_guid} has no associated mine')
        return

    permit = amendment.permit
    if not permit:
        print(f'Permit amendment {permit_amendment_guid} has no associated permit')
        return

    tasks = amendment.permit_extraction_tasks
    latest_task = tasks[0] if tasks else None

    document_name = ''
    document_guid = ''

    if latest_task and latest_task.permit_amendment_document:
        doc = latest_task.permit_amendment_document
        document_name = doc.document_name
        document_guid = doc.document_manager_guid

    condition_rows = []
    for condition in conditions:
        row = {
            'step': condition.step or '',
            'category': condition.condition_category.description,
            'status': condition.permit_condition_status.description,
            'display_order': condition.display_order,
            'issue_date': amendment.issue_date,
            'permit': permit.permit_no,
            'mine_number': mine.mine_no,
            'mine_name': mine.mine_name,
            'document_name': document_name,
            'document_manager_guid': document_guid,
            'permit_guid': str(permit.permit_guid),
            'mine_guid': str(mine.mine_guid),
            'permit_amendment_guid': str(amendment.permit_amendment_guid),
            'permit_condition_guid': str(condition.permit_condition_guid),
            'id': str(condition.permit_condition_guid),
            'condition': condition.condition,
        }
        if csv_writer:
            csv_writer.writerow(row)
        condition_rows.append(row)

    if csv_writer:
        print(f'Exported {len(conditions)} conditions for amendment {permit_amendment_guid}')
        return condition_rows
    else:
        # Create individual file if no csv_writer provided
        filename = f'permit_conditions_{permit_amendment_guid}.csv'
        with open(filename, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            for row in condition_rows:
                writer.writerow(row)
        print(f'Successfully exported {len(conditions)} conditions to {filename}')
        return filename


def bulk_export_permit_conditions(csv_path):
    """
    Export permit conditions for multiple permits from a CSV file into a single output file.
    CSV should have a column named 'permit_no' containing permit numbers.
    """
    import csv

    from app.api.mines.permits.permit.models.permit import Permit

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f'permit_conditions_bulk_export_{timestamp}.csv'
    
    success_count = 0
    error_count = 0
    total_conditions = 0
    
    headers = [
        'step', 'category', 'status', 'display_order', 'issue_date',
        'permit', 'mine_number', 'mine_name', 'document_name',
        'document_manager_guid', 'id', 'condition', 'permit_guid',
        'mine_guid', 'permit_amendment_guid', 'permit_condition_guid'
    ]

    with open(output_filename, 'w', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=headers)
        writer.writeheader()

        with open(csv_path, 'r') as infile:
            reader = csv.DictReader(infile)
            if 'permit_no' not in reader.fieldnames:
                print("Error: CSV file must have a 'permit_no' column")
                return

            for row in reader:
                permit_no = row['permit_no']
                print(f"\nProcessing permit {permit_no}...")
                
                permit = Permit.find_by_permit_no(permit_no)
                if not permit:
                    print(f"Error: Permit {permit_no} not found")
                    error_count += 1
                    continue

                mine = permit._all_mines[0]
                permit._context_mine = mine

                amendments = permit.permit_amendments
                if not amendments:
                    print(f"No amendments found for permit {permit_no}")
                    error_count += 1
                    continue

                for amendment in amendments:
                    try:
                        conditions = export_permit_conditions(amendment.permit_amendment_guid, writer)
                        if conditions:
                            success_count += 1
                            total_conditions += len(conditions)
                    except Exception as e:
                        print(f"Error exporting conditions for amendment {amendment.permit_amendment_guid}: {e}")
                        error_count += 1

    print(f"\nExport complete: {success_count} amendments processed with {total_conditions} conditions exported to {output_filename}")
    print(f"Errors: {error_count}")
