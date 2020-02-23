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
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.services.document_generator_service import DocumentGeneratorService


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(
        description='Returns the generated document associated with the received token.',
        params={'token': 'uuid4 token to execute the planned file generation for that token'})
    def get(self):
        token = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))
        # cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token))

        if not token_data:
            raise BadRequest('Valid token required for download')

        doc_type = NOWApplicationDocumentType.query.unbound_unsafe().get(
            token_data['document_type_code'])
        template_path = os.path.join(current_app.root_path,
                                     doc_type.document_template.template_file_path)

        file_gen_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, data=token_data['template_data'])

        return file_gen_resp
