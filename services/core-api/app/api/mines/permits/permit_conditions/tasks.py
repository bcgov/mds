import csv
import datetime
import io
from app.cli_commands.export_permit_conditions import headers, export_permit_conditions
from app.api.search.search.permit_search_service import PermitSearchService
from app.tasks.celery import celery
from celery import Task

class PermitConditionTaskBase(Task):
    def __call__(self, *args, **kwargs):
        from app.tasks.celery_entrypoint import celery_app

        # Make sure app context is set up when running the task so we can access the database
        with celery_app.app_context():
            return Task.__call__(self, *args, **kwargs)

@celery.task(base=PermitConditionTaskBase)
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