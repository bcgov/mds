import json

from werkzeug.exceptions import BadRequest, BadGateway
from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.config import Config
from app.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE
from app.services.object_store_storage_service import ObjectStoreStorageService

DOCUMENT_UPLOAD_ROLES = [
    MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT
]


@api.route('/tusd-hooks')
class TusdHooks(Resource):
    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):

        # Parse data
        key = None
        info_key = None
        new_key = None
        try:
            data = json.loads(request.data)
            key = data["Upload"]["Storage"]["Key"]
            info_key = f'{key}.info'
            # NOTE: We need to remove the beginning slash from the path because the S3 prefix has a trailing slash
            new_key = f'{Config.S3_PREFIX}{data["Upload"]["MetaData"]["path"][1:]}'
        except Exception as e:
            raise BadRequest(f'Failed to parse data: {e}')

        # Copy the file to its new location
        try:
            copy_source = {'Bucket': Config.OBJECT_STORE_BUCKET, 'Key': key}
            ObjectStoreStorageService().copy_file(copy_source, new_key)
        except Exception as e:
            raise BadGateway(f'Object store copy request failed: {e}')

        # Delete the old file and its .info file
        try:
            ObjectStoreStorageService().delete_file(key)
            ObjectStoreStorageService().delete_file(info_key)
        except Exception as e:
            raise BadGateway(f'Object store delete request failed: {e}')

        return ('', 204)