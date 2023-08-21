import io
import os
import uuid
import threading
from datetime import datetime
from app.config import Config
from app.extensions import db
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.tasks.celery import celery, doc_task_result
from app.docman.models.document import Document


@celery.task()
def zip_docs(zip_id, doc_ids, zip_file_name):

    try:        
        # Retrieve the documents to be zipped
        docs = []
        docs = Document.query.filter(Document.document_id.in_(doc_ids)).all()
        zip_progress = 0
        upload_progress = 0

        if not docs or len(docs) == 0:
            raise Exception("No documents found")

        # Define function to update the task state with the progress
        def progress_callback(progress_type, current, total):
            nonlocal zip_progress
            nonlocal upload_progress
            
            # Update the zip progress if zipping files
            if progress_type == 'ZIPPING_FILES':
                zip_progress = current / total * 100
                
             # Update the upload progress if uploading the zip file
            if progress_type == 'UPLOADING_ZIP':
                upload_progress = current / total * 100
                
            # Calculate the overall progress as the average of the zip and upload progress
            overall_progress = round((zip_progress + upload_progress) / 2)
            
            # Update the task state with the overall progress
            zip_docs.update_state(state=progress_type, meta={'progress': overall_progress})

        file_paths = []
        pretty_paths = []

        # Add each document's object store path and display name to the list of file paths and pretty paths
        for doc in docs:
            file_paths.append(doc.object_store_path)
            pretty_paths.append(doc.file_display_name)

        # Create a new key for saving the zip file to the S3 bucket
        new_key = f"{Config.S3_PREFIX}app/zipped_docs/{zip_file_name}"
        # Create and Upload the zip file to the S3 bucket
        ObjectStoreStorageService().create_zip_and_upload(
            key=new_key,
            document_paths=file_paths,
            pretty_paths=pretty_paths,
            progress_callback=progress_callback,
        )

        # Create a document record for the zip file
        base_folder = "/app/zipped_docs/"
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
        message = "All documents were successfully zipped and uploaded"
        result = doc_task_result(
            job_id=zip_id,
            task_id=zip_docs.request.id,
            chunk=None,
            success=success,
            message=message,
            success_docs=[document_guid],
            errors=[],
            doc_ids=[doc_ids],
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