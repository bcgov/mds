from flask import current_app, make_response, jsonify, request
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest
from sqlalchemy import and_
import requests
import json
import time

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
        from app.services.commands_helper import set_import_job_task_id, apply_task_async, abort_task
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
            # TODO call REST API instead
            # celery.control.revoke(job.celery_task_id, terminate=True)
            abort_task(job.celery_task_id)
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

        # TODO instead call a rest client for to start the task
        # message = create_import_now_submission_documents(
        #     import_job.import_now_submission_documents_job_id)

        data = {"args": [import_job.import_now_submission_documents_job_id]}

        current_app.logger.debug(json.dumps(data))

        response = apply_task_async(
            'app.tasks.import_now_submission_documents.import_now_submission_documents', data)

        message = set_import_job_task_id(import_job.import_now_submission_documents_job_id,
                                         response['task-id'])

        # Return a response indicating that the job has started.
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
