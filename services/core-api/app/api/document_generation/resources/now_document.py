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


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(description='Returns the generated document associated with the received token.')
    def get(self):
        token_guid = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid))
        cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid))

        if not token_data:
            raise BadRequest('Valid token required for download')

        document_type_code = token_data['document_type_code']
        file_name = NOW_DOCUMENT_TEMPLATE_TYPES[document_type_code]

        return send_file(
            os.path.join(current_app.root_path, 'document_templates', 'now', file_name),
            as_attachment=True,
            attachment_filename=file_name)
