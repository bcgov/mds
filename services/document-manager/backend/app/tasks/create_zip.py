import io
from zipstream import ZipFile

from app.config import Config
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.tasks.celery import celery, doc_task_result


@celery.task()
def zip_docs(docs):
    try:
        doc_ids = [doc.id for doc in docs]

        # Create a zip file object
        zip_file = ZipFile(mode="w", compression=zipfile.ZIP_DEFLATED)

        # Add each document to the zip file
        for doc in docs:
            file_data = ObjectStoreStorageService().download_file(
                path=doc.object_store_path,
                display_name=doc.file_display_name,
                as_attachment=False,
            ).content
            zip_file.writestr(doc.filename, file_data)

        # Finalize the zip file and get the zipped data
        zip_file.close()
        zip_data = zip_file.fp.getvalue()

        # Upload the zip data to the S3 bucket
        new_key = f"{Config.S3_PREFIX}/zipped_docs/docs.zip"
        ObjectStoreStorageService().upload_file(
            filename=io.BytesIO(zip_data),
        )

        # Determine the result of the zipping
        success = True
        message = "All documents were successfully zipped"
        result = doc_task_result(
            job_id=None,
            task_id=zip_docs.request.id,
            chunk=None,
            success=success,
            message=message,
            success_docs=doc_ids,
            errors=[],
            doc_ids=doc_ids,
        )

    except Exception as e:
        message = f"An unexpected exception occurred: {e}"
        result = doc_task_result(
            job_id=None,
            task_id=zip_docs.request.id,
            chunk=None,
            success=False,
            message=message,
            success_docs=[],
            errors=[{"exception": str(e), "document": None}],
            doc_ids=[doc.id for doc in docs],
        )

    # Return the result of the zipping
    return result