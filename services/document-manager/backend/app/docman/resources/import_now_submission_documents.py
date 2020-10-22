import json
import requests

from flask import current_app, make_response, jsonify, request
from flask_restplus import Resource, reqparse

from app.extensions import api


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsResource(Resource):
    # parser = reqparse.RequestParser(trim=True)
    # parser.add_argument('now_application_id', type=str, required=False, help='')
    # parser.add_argument('submission_documents', type=str, required=False, help='')

    # @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents

        # data = self.parser.parse_args()
        # current_app.logger.info(f'data:\n{data}')

        # now_application_id = data.get('now_application_id', None)
        # submission_documents = data.get('submission_documents', [])

        # Determine if a job for this NoW is already running
        job_running = False

        # If a job is running, stop and restart it
        if job_running:
            pass

        # Else, create a new job
        else:
            # create_import_now_submission_documents()
            pass

        resp = make_response(jsonify(test='123'), 201)

        current_app.logger.info(
            f'ImportNowSubmissionDocumentsResource post resp.__dict__:{resp.__dict__}')

        return resp
