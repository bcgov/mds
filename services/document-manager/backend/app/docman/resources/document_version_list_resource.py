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
from flask import request, current_app, make_response, jsonify
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, RequestEntityTooLarge, InternalServerError, BadGateway

CACHE_TIMEOUT = TIMEOUT_24_HOURS


@api.route(f'/documents/<string:document_guid>/versions')
class DocumentVersionListResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'filename', type=str, required=False, help='File name + extension of the document.')

    # @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self, document_guid):
        document = Document.query.filter_by(
            document_guid=document_guid).one_or_none()

        if not document:
            raise NotFound('Document not found')

        file_size, data, filename = DocumentUploadHelper().parse_and_validate_uploaded_file(
            self.parser.parse_args())

        document_guid = str(document.document_guid)
        version_guid = str(uuid.uuid4())

        response, object_store_path = DocumentUploadHelper.initiate_document_upload(
            document_guid=document_guid,
            file_path=document.full_storage_path,
            folder=None,
            file_size=file_size,
            version_guid=version_guid)

        # Create document record
        new_version = DocumentVersion(
            document_guid=document.document_guid,
            created_by='mds',
            created_date=datetime.utcnow(),
            object_store_version_id=version_guid,
            file_display_name=filename,
            upload_started_date=datetime.utcnow(),
        )
        new_version.save()

        return response
