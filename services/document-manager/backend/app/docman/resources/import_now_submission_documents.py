import json

from flask_restplus import Resource, reqparse
from flask import current_app, make_response, jsonify

from app.extensions import api


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    # parser.add_argument('now_application_id', type=str, required=False, help='')
    # parser.add_argument('submission_documents', type=str, required=False, help='')
    parser.add_argument(
        'folder', type=str, required=False, help='The sub folder path to store the document in.')

    # @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents

        data = self.parser.parse_args()

        current_app.logger.info(f'*********************************************************')
        current_app.logger.info(f'data:\n{data}')

        # now_application_id = data.get('now_application_id', None)
        # submission_documents = data.get('submission_documents', [])
        current_app.logger.info(f'data:{data}')

        # Determine if a job for this NoW is already running
        job_running = False

        # If a job is running, stop and restart it
        if job_running:
            pass

        # Else, create a new job
        else:
            # create_import_now_submission_documents()
            pass

        return make_response(jsonify(xxx='started'), 201)
