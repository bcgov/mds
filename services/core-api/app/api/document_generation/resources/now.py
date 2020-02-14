import os
from flask import Response, json, current_app, send_file
from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_permit
# from app.api.utils.custom_reqparser import CustomReqparser


class NoticeOfWorkDocumentGeneration(Resource, UserMixin):

    documents = {
        'CAL': 'Client Acknowledgment Letter Template (NoW).docx',
        'RJL': 'Rejection Letter Template (NoW).docx',
        'WDL': 'Withdrawl Letter Template (NoW).docx'
    }

    # parser = CustomReqparser()
    # parser.add_argument('now_application_guid', type=str, location='json', required=True)
    # parser.add_argument('template_data', type=str, location='json', required=True)

    @api.doc(
        description='Generates the specified document for the NoW using the provided template data.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @requires_role_edit_permit
    def post(self, document_type_code):
        # data = self.parser.parse_args()

        if document_type_code not in NoticeOfWorkDocumentGeneration.documents:
            raise NotFound('Document type code not found')

        # def getFileContent(fileName):
        #     filePath = os.path.join(current_app.root_path, 'files', fileName)
        #     with open(filePath, 'rb') as f:
        #         return f.read().decode('ISO-8859-1')

        file_name = NoticeOfWorkDocumentGeneration.documents[document_type_code]
        # file_content = getFileContent(file_name)

        # data = json.dumps({'file_name': file_name, 'file_content': file_content})
        # return Response(data)
        return send_file(
            os.path.join(current_app.root_path, 'files', file_name), mimetype='application/msword')
