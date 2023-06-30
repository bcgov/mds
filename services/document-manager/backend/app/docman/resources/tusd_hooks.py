import json

from datetime import datetime

from werkzeug.exceptions import BadRequest, BadGateway, InternalServerError
from flask import request
from flask_restplus import Resource

from app.extensions import api, db
from app.config import Config
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES
from app.services.object_store_storage_service import ObjectStoreStorageService
from app.docman.models.document import Document
from app.docman.models.document_version import DocumentVersion


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
            versionId = data["version"]["versionId"]
            versionTimestamp = data["version"]["timestamp"]

            # If the path is in the key there is no need to move the file
            if (path in key):
                return ('', 204)
        except Exception as e:
            raise BadRequest(f'Failed to parse data: {e}')

        # Copy the file to its new location
        try:
            ObjectStoreStorageService().copy_file(source_key=key, key=new_key)
        except Exception as e:
            raise BadGateway(f'Object store copy request failed: {e}')

        # Update the document's object store path and create a new version
        try:
            doc = Document.find_by_document_guid(doc_guid)
            doc.object_store_path = new_key
            doc.update_user = 'mds'
            file_display_name = doc.file_display_name

            db.session.rollback()
            db.session.add(doc)

            if version_guid is not None:
                version = DocumentVersion.find_by_id(version_guid)
                version.object_store_version_id = versionId

                db.session.add(version)

            db.session.commit()

        except Exception as e:
            raise InternalServerError(
                f'Failed to update the document\'s object store path: {e}')

        # Delete the old file and its .info file
        try:
            ObjectStoreStorageService().delete_file(key)
            ObjectStoreStorageService().delete_file(info_key)
        except Exception as e:
            raise BadGateway(f'Object store delete request failed: {e}')

        return ('', 204)
