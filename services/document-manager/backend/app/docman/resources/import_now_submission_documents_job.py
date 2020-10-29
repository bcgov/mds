from flask import current_app, make_response, jsonify, request
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest
from sqlalchemy import and_

from app.extensions import api
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument
from app.utils.include.user_info import User
from app.docman.response_models import IMPORT_NOW_SUBMISSION_DOCUMENTS_JOB


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsJobListResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('now_application_id', type=int, required=True)
    parser.add_argument('now_application_guid', type=str, required=True)
    parser.add_argument('submission_documents', type=list, location='json', required=True)

    # TODO: Determine required role(s).
    # @requires_any_of()
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents
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
                ImportNowSubmissionDocumentsJob.import_now_submission_documents_job_status_code ==
                'INP')).all()
        for job in in_progress_jobs:
            job.import_now_submission_documents_job_status_code = 'REV'
            celery.control.revoke(job.celery_task_id, terminate=True)
            job.save()

        # Create the Import NoW Submission Documents job record.
        import_job = ImportNowSubmissionDocumentsJob(
            now_application_id=now_application_id,
            now_application_guid=now_application_guid,
            create_user=User().get_user_username())
        for doc in submission_documents:
            already_imported = ImportNowSubmissionDocument.query.filter(
                and_(ImportNowSubmissionDocument.submission_document_id == doc['id'],
                     ImportNowSubmissionDocument.document_id != None)).one_or_none()
            if already_imported:
                continue
            import_job.import_now_submission_documents.append(
                ImportNowSubmissionDocument(
                    submission_document_id=doc['id'],
                    submission_document_url=doc['documenturl'],
                    submission_document_file_name=doc['filename']))
        import_job.save()

        # Create the Import NoW Submission Documents job.
        # TODO: Handle case where this returns an error.
        message = create_import_now_submission_documents(
            import_job.import_now_submission_documents_job_id)

        # Return a response indicating that the job has started.
        resp = make_response(jsonify(message=message), 201)
        return resp

    # TODO: Determine required role(s).
    @api.marshal_with(IMPORT_NOW_SUBMISSION_DOCUMENTS_JOB, code=200)
    # @requires_any_of()
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
