from flask import current_app, make_response, jsonify
from flask_restplus import Resource, reqparse

from app.extensions import api
from app.docman.models.import_now_submission_documents_job import ImportNowSubmissionDocumentsJob
from app.docman.models.import_now_submission_document import ImportNowSubmissionDocument
from app.utils.include.user_info import User


@api.route('/import-now-submission-documents')
class ImportNowSubmissionDocumentsResource(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('now_application_id', type=int, required=False, help='')
    parser.add_argument('submission_documents', type=list, location='json', required=False, help='')

    # TODO: Determine required role(s).
    # @requires_any_of()
    def post(self):
        from app.services.commands_helper import create_import_now_submission_documents

        # Get the NoW Application ID and its submission documents to transfer.
        data = self.parser.parse_args()
        now_application_id = data.get('now_application_id', None)
        submission_documents = data.get('submission_documents', [])

        # Create the Import NoW Submission Documents job record.
        import_job = ImportNowSubmissionDocumentsJob(
            now_application_id=now_application_id, create_user=User().get_user_username())
        for doc in submission_documents:
            import_job.import_now_submission_documents.append(
                ImportNowSubmissionDocument(
                    submission_document_id=doc['id'],
                    submission_document_url=doc['documenturl'],
                    submission_document_file_name=doc['filename']))
        import_job.save()

        # Create the Import NoW Submission Documents job.
        # create_import_now_submission_documents(import_job.import_now_submission_documents_job_id)

        # Return a response indicating that the job has started.
        message = f'Successfuly created Import NoW Submission Documents job with ID {None}'
        resp = make_response(jsonify(message=message), 201)

        current_app.logger.info(
            f'ImportNowSubmissionDocumentsResource post resp.__dict__:{resp.__dict__}')

        return resp
