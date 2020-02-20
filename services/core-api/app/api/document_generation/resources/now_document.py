import os
import uuid
from flask import current_app, send_file, request
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound, BadRequest
from app.extensions import api, cache
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.constants import NOW_DOCUMENT_DOWNLOAD_TOKEN
from app.api.services.document_generator_service import DocumentGeneratorService

NOW_DOCUMENT_TEMPLATE_TYPES = {
    'CAL': 'Client Acknowledgment Letter Template (NoW).docx',
    'RJL': 'Rejection Letter Template (NoW).docx',
    'WDL': 'Withdrawl Letter Template (NoW).docx'
}


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(description='Returns the generated document associated with the received token.')
    def get(self):
        token = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        # cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))

        if not token_data:
            raise BadRequest('Valid token required for download')

        template_path = os.path.join(current_app.root_path, 'document_templates', 'now',
                                     NOW_DOCUMENT_TEMPLATE_TYPES['CAL'])
        current_app.logger.debug(template_path)
        file_gen_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, data=token_data['template_data'])

        return file_gen_resp
