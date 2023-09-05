import json
import uuid

from datetime import datetime

from werkzeug.exceptions import BadRequest, BadGateway, InternalServerError
from flask import request
from flask_restx import Resource

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
            versions = data["versions"] if "versions" in data else []

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
            db.session.rollback()

            doc = Document.find_by_document_guid(doc_guid)
            if doc.object_store_path != new_key:
                doc.object_store_path = new_key
                doc.update_user = 'mds'

                db.session.add(doc)

            # update the record of the previous version
            if len(versions) >= 1:
                # Sort the versions
                versions.sort(key=lambda v: v["LastModified"], reverse=True)

                # create a version record for the previous version
                previous_version_data = versions[0]

                # get the versionId of the previous version
                previous_version_id = previous_version_data["VersionId"]

                # find the corresponding DocumentVersion record
                if version_guid is not None:
                    previous_version = DocumentVersion.find_by_id(version_guid)

                    if previous_version is not None:
                        previous_version.object_store_version_id = previous_version_id
                        previous_version.upload_completed_date = datetime.utcnow()

                        db.session.add(previous_version)

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
