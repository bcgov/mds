from flask_restplus import Resource, reqparse
from flask import current_app
from app.services.commands_helper import create_import_now_submission_documents


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('now_application_id', type=str, required=False, help='')
    parser.add_argument('submission_documents', type=list, required=False, help='')

    # @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        data = self.parser.parse_args()
        now_application_id = data.get('now_application_id', None)
        submission_documents = data.get('submission_documents', [])
        current_app.logger.info(f'data:{data}')

        # TODO: Verify the Now application
        # ...

        # Determine if a job for this NoW is already running
        job_running = False

        # If a job is running, stop and restart it
        if job_running:
            pass

        # Else, create a new job
        else:
            # create_import_now_submission_documents()
