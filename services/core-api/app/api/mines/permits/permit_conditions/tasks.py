import csv
import datetime
import io

from app.api.search.search.permit_search_service import PermitSearchService
from app.api.tasks.celery_task_base import TaskBase
from app.cli_commands.export_permit_conditions import export_permit_conditions, headers
from app.tasks.celery import celery


@celery.task(base=TaskBase)
def export_and_index_permit_amendments(permit_amendment_guids, is_manual=False):
    """
    Export conditions for a permit amendment as a CSV file and index them in the search service.
    """
    try:
        # Create temporary file
        csv_data = io.StringIO()
        writer = csv.DictWriter(csv_data, fieldnames=headers)
        writer.writeheader()
        
        for permit_amendment_guid in permit_amendment_guids:
            export_permit_conditions(permit_amendment_guid, csv_writer=writer)

        csv_data.seek(0)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f'{"manual_" if is_manual else ""}permit_conditions_bulk_export_{timestamp}.csv'
        PermitSearchService().blob_upload(csv_data.getvalue(),output_filename)
    except Exception as e:
        print(f"Exception in export_and_index_permit_amendments: {e}")
        raise