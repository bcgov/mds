import os
import uuid
from flask import current_app, send_file, request
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotFound, BadRequest, NotImplemented
from app.extensions import api, cache
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.constants import TIMEOUT_5_MINUTES, NOW_DOCUMENT_TEMPLATE_TYPES

NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL = api.model('NoticeOfWorkDocumentDownloadToken',
                                              {'token_guid': fields.String})


def NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid):
    return f'now-document-types:download-token:{token_guid}'


class NoticeOfWorkDocumentGenerationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=str, location='json', required=True)

    @api.doc(
        description='Generates the specified document for the NoW using the provided template data.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @requires_role_edit_permit
    def post(self, document_type_code):
        data = self.parser.parse_args()

        if document_type_code not in NOW_DOCUMENT_TEMPLATE_TYPES:
            raise NotFound('Document type code not found')

        raise NotImplemented('This endpoint is under construction')


class NoticeOfWorkDocumentResource(Resource, UserMixin):
    @api.doc(
        description='Returns the specified template document.',
        params={'document_type_code': 'The code indicating the type of document to return.'})
    def get(self, document_type_code):
        token_guid = request.args.get('token', '')
        token_data = cache.get(NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid))
        cache.delete(NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid))

        if not token_data:
            raise BadRequest('Valid token required for download')

        if document_type_code not in NOW_DOCUMENT_TEMPLATE_TYPES:
            raise NotFound('Document type code not found')

        file_name = NOW_DOCUMENT_TEMPLATE_TYPES[document_type_code]

        return send_file(
            os.path.join(current_app.root_path, 'document_templates', 'now', file_name),
            as_attachment=True,
            attachment_filename=file_name)


class NoticeOfWorkDocumentTokenResource(Resource, UserMixin):
    @api.doc(
        description='Issues a one-time token for access to a document without auth headers.',
        params={
            'document_type_code':
            'The code indicating the type of document to retrieve a download token for.'
        })
    @api.marshal_with(NOW_DOCUMENT_DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_view_all
    def get(self, document_type_code):
        if document_type_code not in NOW_DOCUMENT_TEMPLATE_TYPES:
            raise NotFound('Document type code not found')

        token_guid = uuid.uuid4()
        cache.set(
            NOW_DOCUMENT_DOWNLOAD_TOKEN(token_guid), {'document_type_code': document_type_code},
            TIMEOUT_5_MINUTES)

        return {'token_guid': token_guid}