import io
import os
import uuid
from datetime import datetime
from app.config import Config
from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.tasks.celery import celery, doc_task_result
from celery.utils.log import get_task_logger
from app.docman.models.document import Document

@celery.task()
def zip_docs(zip_id, doc_ids, zip_file_name):

    try:
        logger = get_task_logger(str(zip_id))
        docs = []
        docs = Document.query.filter(Document.document_id.in_(doc_ids)).all()

        if not docs or len(docs) == 0:
            raise Exception("No documents found")

        logger.info(f"Zipping {len(docs)} documents...")

        # Define the progress callback functions
        def progress_callback(progress_type, current, total):
            percent_complete = int(current / total * 100)
            zip_docs.update_state(state=progress_type, meta={'progress': percent_complete})

        # Create a zip file object
        zip_file = io.BytesIO()
        file_paths = []
        for doc in docs:
            file_paths.append(doc.object_store_path)

        ObjectStoreStorageService().download_files_and_write_to_zip(
            paths=file_paths,
            zip_file=zip_file,
            progress_callback=progress_callback,
            progress_total=len(docs),
        )

        # Upload the zip data to the S3 bucket
        zip_data = zip_file.getvalue()

        def upload_progress_callback(bytes_uploaded):
            progress_callback('UPLOADING_PROGRESS', bytes_uploaded, len(zip_data))

        new_key = f"{Config.S3_PREFIX}app/zipped_docs/{zip_file_name}"

        ObjectStoreStorageService().upload_zip_file(
            file_data=io.BytesIO(zip_data),
            key=new_key,
            progress_callback=upload_progress_callback,
            progress_total=len(zip_data),
        )

        # Update the task state to indicate that the task is complete
        zip_docs.update_state(state='SUCCESS', meta={'progress': 100})

        # Check if a Document object already exists for the zipped file
        existing_document = Document.query.filter_by(object_store_path=new_key).first()
        if existing_document:
            # If a Document object already exists, update its metadata and commit the changes
            existing_document.upload_completed_date = datetime.utcnow()
            existing_document.update_user = "system"
            existing_document.update_timestamp = datetime.utcnow()
            db.session.commit()
        else:
            # If a Document object does not already exist, create a new one and save it to the database
            base_folder = "app/zipped_docs/"
            pretty_path = os.path.join(base_folder, zip_file_name)
            document_guid = str(uuid.uuid4())
            object_store_path = os.path.join(Config.S3_PREFIX, pretty_path)

            document = Document(
                document_guid=document_guid,
                full_storage_path=object_store_path,
                upload_started_date=datetime.utcnow(),
                upload_completed_date=datetime.utcnow(),
                path_display_name=pretty_path,
                file_display_name=zip_file_name,
                object_store_path=new_key,
                create_user="system",
                update_user="system",
                update_timestamp=datetime.utcnow(),
            )

            db.session.add(document)
            db.session.commit()

        # Determine the result of the zipping
        success = True
        message = "All documents were successfully zipped"
        result = doc_task_result(
            job_id=zip_id,
            task_id=zip_docs.request.id,
            chunk=None,
            success=success,
            message=message,
            success_docs=doc_ids,
            errors=[],
            doc_ids=doc_ids,
        )

    except Exception as e:
        db.session.rollback()
        message = f"An unexpected exception occurred: {e}"
        result = doc_task_result(
            job_id=zip_id,
            task_id=zip_docs.request.id,
            chunk=None,
            success=False,
            message=message,
            success_docs=[],
            errors=[{"exception": str(e), "document": None}],
            doc_ids=doc_ids,
        )

    # Return the result of the zipping
    return result