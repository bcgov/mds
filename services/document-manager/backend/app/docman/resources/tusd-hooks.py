import json

from werkzeug.exceptions import BadRequest, BadGateway
from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.config import Config
from app.utils.access_decorators import requires_role_document_upload
from app.services.object_store_storage_service import ObjectStoreStorageService


@api.route('/tusd-hooks')
class TusdHooks(Resource):
    @requires_role_document_upload
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

        # Parse data
        try:
            # If the path is in the key there is no need to move the file
            path = data["Upload"]["MetaData"]["path"][1:]
            key = data["Upload"]["Storage"]["Key"]
            if (path in key):
                return ('', 204)

            info_key = f'{key}.info'
            # NOTE: We need to remove the beginning slash from the path because the S3 prefix has a trailing slash
            new_key = f'{Config.S3_PREFIX}{path}'
        except Exception as e:
            raise BadRequest(f'Failed to parse data: {e}')

        # Copy the file to its new location
        try:
            ObjectStoreStorageService().copy_file(source_key=key, key=new_key)
        except Exception as e:
            raise BadGateway(f'Object store copy request failed: {e}')

        # Delete the old file and its .info file
        try:
            ObjectStoreStorageService().delete_file(key)
            ObjectStoreStorageService().delete_file(info_key)
        except Exception as e:
            raise BadGateway(f'Object store delete request failed: {e}')

        return ('', 204)