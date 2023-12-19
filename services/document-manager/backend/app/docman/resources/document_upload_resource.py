import base64
import time
import uuid
from datetime import datetime
from urllib.parse import urlparse
from wsgiref.handlers import format_date_time

from app.docman.utils.document_upload_helper import DocumentUploadHelper
import requests
from app.docman.models.document_version import DocumentVersion
from app.config import Config
from app.constants import OBJECT_STORE_PATH, OBJECT_STORE_UPLOAD_RESOURCE, FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, \
    FILE_UPLOAD_PATH, FILE_UPLOAD_EXPIRY, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, \
    FORBIDDEN_FILETYPES
from app.docman.models.document import Document
from app.extensions import api, cache
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES
from app.docman.models.document_upload_status import DocumentUploadStatus
from flask import request, current_app, make_response, jsonify
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, Forbidden, NotFound, RequestEntityTooLarge, InternalServerError, BadGateway
from app.utils.include.user_info import User

CACHE_TIMEOUT = TIMEOUT_24_HOURS


@api.route(f'/documents/<string:document_guid>/complete-upload')
class DocumentUploadResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'upload_id', type=str, required=True, help='S3 Multipart upload id that should be completed.', location='json',)
    parser.add_argument(
        'version_guid', type=str, required=False, help='Guid of version of document you are uploading', location='json',)
    parser.add_argument(
        'parts', type=list, required=True, help='List of multipart upload parts', location='json',
    )

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def patch(self, document_guid):

        data = self.parser.parse_args()

        document = Document.query.filter_by(
            document_guid=document_guid).one_or_none()

        if not document:
            raise NotFound('Document not found')

        if document.status == str(DocumentUploadStatus.SUCCESS):
            raise BadRequest('Forbidden, Document upload has already been completed.')
        
        if document.create_user != User().get_user_username():
            raise Forbidden("Cannot complete upload of file you did not upload")
        
        return DocumentUploadHelper().complete_multipart_upload(
            upload_id=data['upload_id'],
            parts=data['parts'],
            document=document,
            version=None
        )
