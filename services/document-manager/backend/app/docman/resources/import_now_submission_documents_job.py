from flask import current_app, make_response, jsonify, request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest
from sqlalchemy import and_
import json

from app.extensions import api
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument
from app.utils.include.user_info import User
from app.utils.access_decorators import requires_role_edit_permit, requires_role_view_all
from app.docman.response_models import IMPORT_NOW_SUBMISSION_DOCUMENTS_JOB


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsJobListResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('now_application_id', type=int, required=True)
    parser.add_argument('now_application_guid', type=str, required=True)
    parser.add_argument('submission_documents', type=list, location='json', required=True)

    @requires_role_edit_permit
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents, abort_task
        from app.tasks.celery import celery

        # Get the NoW Application ID and its submission documents to transfer.
        data = self.parser.parse_args()
        now_application_id = data.get('now_application_id', None)
        now_application_guid = data.get('now_application_guid', None)
        submission_documents = data.get('submission_documents', [])

        # If any jobs for this Notice of Work are in progress, cancel them.
        in_progress_jobs = ImportNowSubmissionDocumentsJob.query.filter(
            and_(
                ImportNowSubmissionDocumentsJob.now_application_id == now_application_id,
                ImportNowSubmissionDocumentsJob.import_now_submission_documents_job_status_code.in_(
                    ['NOT', 'INP', 'DEL']))).all()
        for job in in_progress_jobs:
            job.import_now_submission_documents_job_status_code = 'REV'
            abort_task(job.celery_task_id)
            job.save()

        # Create the Import NoW Submission Documents job record.
        import_job = ImportNowSubmissionDocumentsJob(
            now_application_id=now_application_id,
            now_application_guid=now_application_guid,
            create_user=User().get_user_username())

        # Only import documents that have not already been added to an import job and transfer any in-progress documents from the cancelled in-progress jobs to this one.
        for doc in submission_documents:
            documenturl = doc['documenturl']
            filename = doc['filename']
            messageid = doc['messageid']
            documenttype = doc['documenttype']
            description = doc['description']

            # Get the possible already-existing record for this document.
            existing_doc = ImportNowSubmissionDocument.query.filter(
                and_(ImportNowSubmissionDocument.submission_document_url == documenturl,
                     ImportNowSubmissionDocument.submission_document_file_name == filename,
                     ImportNowSubmissionDocument.submission_document_message_id == messageid,
                     ImportNowSubmissionDocument.submission_document_type == documenttype,
                     ImportNowSubmissionDocument.submission_document_description ==
                     description)).one_or_none()

            # Only import this existing document if it has not already been imported successfully.
            if existing_doc:
                if existing_doc.document_id is None:
                    import_job.import_now_submission_documents.append(existing_doc)
                continue
            import_job.import_now_submission_documents.append(
                ImportNowSubmissionDocument(
                    submission_document_url=documenturl,
                    submission_document_file_name=filename,
                    submission_document_message_id=messageid,
                    submission_document_type=documenttype,
                    submission_document_description=description))
        import_job.save()

        # Create the Import NoW Submission Documents job.
        message = create_import_now_submission_documents(
            import_job.import_now_submission_documents_job_id)

        # Return a response indicating that the task has started.
        result = make_response(jsonify(message=message), 201)

        return result

    @api.marshal_with(IMPORT_NOW_SUBMISSION_DOCUMENTS_JOB, code=200, skip_none=True)
    @requires_role_view_all
    def get(self):
        now_application_guid = request.args.get('now_application_guid', None)
        if not now_application_guid:
            raise BadRequest('now_application_guid is required')

        import_jobs = ImportNowSubmissionDocumentsJob.find_by_now_application_guid(
            now_application_guid)

        most_recent_only = request.args.get('most_recent_only', False)
        if most_recent_only:
            return import_jobs[-1] if import_jobs else {}

        return import_jobs
