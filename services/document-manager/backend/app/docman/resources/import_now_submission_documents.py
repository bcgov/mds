import json
import requests

from flask import current_app, make_response, jsonify, request
from flask_restplus import Resource, reqparse

from app.extensions import api
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('now_application_id', type=int, required=False, help='')
    parser.add_argument('submission_documents', type=list, location='json', required=False, help='')

    # @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents

        #
        data = None
        try:
            data = self.parser.parse_args()
        except Exception as e:
            current_app.logger.info(f'Failed to parse data:\n{str(e)}')

        #
        now_application_id = data.get('now_application_id', None)
        submission_documents = data.get('submission_documents', [])

        # Create the Import NoW Submission Documents job record
        import_job = ImportNowSubmissionDocumentsJob(now_application_id=now_application_id)
        for doc in submission_documents:
            import_job.submission_documents.append(
                ImportNowSubmissionDocument(
                    submission_document_id=doc['id'],
                    submission_document_url=doc['documenturl'],
                    submission_document_file_name=doc['filename']))

        resp = make_response(jsonify(test='123'), 201)

        current_app.logger.info(
            f'ImportNowSubmissionDocumentsResource post resp.__dict__:{resp.__dict__}')

        return resp
