import json
import uuid

from datetime import datetime

from werkzeug.exceptions import BadRequest, BadGateway, InternalServerError
from flask import request, current_app
from flask_restx import Resource

from app.extensions import api, db
from app.config import Config
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.docman.models.document_version import DocumentVersion
from app.docman.utils.document_upload_helper import DocumentUploadHelper, handle_status_and_update_doc

@api.route('/tusd-hooks')
class TusdHooks(Resource):
    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        hook = request.headers.get('Hook-Name', None)
        if (hook is None):
            raise BadRequest('Hook-Name header must be present')

        try:
            data = json.loads(request.data)
        except Exception as e:
            raise BadRequest(f'Failed to parse data: {e}')

        if (hook == 'post-finish'):
            return self.post_finish(data)

        return ('', 204)

    def post_finish(self, data):
        key = None
        info_key = None
        new_key = None
        doc_guid = None
        version_guid = None

        # Parse data
        try:
            path = data["Upload"]["MetaData"]["path"][1:]
            key = data["Upload"]["Storage"]["Key"]
            info_key = f'{key}.info'
            new_key = f'{Config.S3_PREFIX}{path}'
            doc_guid = data["Upload"]["MetaData"]["doc_guid"]
            version_guid = data["Upload"]["MetaData"].get("version_guid")
            versions = data["versions"] if "versions" in data else []

            # If the path is in the key there is no need to move the file
            if (path in key):
                return ('', 204)
        except Exception as e:
            handle_status_and_update_doc(e, doc_guid)
            raise e
        
        return DocumentUploadHelper.complete_upload(key, new_key,doc_guid, versions, version_guid, info_key)
