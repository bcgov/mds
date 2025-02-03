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


def export_permit_conditions(permit_amendment_guid):
    """
    Export permit conditions for the specified permit amendment to a CSV file.
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

    # Create filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'permit_conditions_{permit_amendment_guid}.csv'
    
    # Define CSV headers
    headers = [
        'step',
        'category',
        'status',
        'display_order',
        'issue_date',
        'permit',
        'mine_number',
        'mine_name',
        'condition_guid',
        'condition',
    ]

    # Write to CSV
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        
        for condition in conditions:
            writer.writerow({
                'step': condition.step or '',
                'category': condition.condition_category.description,
                'status': condition.permit_condition_status.description,
                'display_order': condition.display_order,
                'issue_date': amendment.issue_date,
                'permit': permit.permit_no,
                'mine_number': mine.mine_no,
                'mine_name': mine.mine_name,
                'condition_guid': str(condition.permit_condition_guid),
                'condition': condition.condition,
            })

    print(f'Successfully exported {len(conditions)} conditions to {filename}')
    return filename