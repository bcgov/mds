import uuid
import requests
import base64
import sys
import json
import os
import boto3

from datetime import datetime
from urllib.parse import urlparse
from app.services.object_store_storage_service import ObjectStoreStorageService

from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError, BadGateway
from flask import request, current_app, send_file, make_response, jsonify
from flask_restplus import Resource, reqparse

from app.docman.models.document import Document
from app.extensions import api, cache
from app.utils.access_decorators import requires_any_of, MINE_EDIT, VIEW_ALL, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE
from app.constants import OBJECT_STORE_PATH, OBJECT_STORE_UPLOAD_RESOURCE, FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, FILE_UPLOAD_PATH, DOWNLOAD_TOKEN, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, FORBIDDEN_FILETYPES
from app.config import Config

DOCUMENT_UPLOAD_ROLES = [
    MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT
]


@api.route('/tusd-hooks')
class TusdHook(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('data', type=str, required=False)

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):

        # Parse the data
        key = None
        info_key = None
        new_key = None
        new_info_key = None
        try:
            data = json.loads(request.data)
            key = data["Upload"]["Storage"]["Key"]
            info_key = f'{key}.info'
            # NOTE: We need to remove the beginning slash from the path because the S3 prefix has a trailing slash
            new_key = f'{Config.S3_PREFIX}{data["Upload"]["MetaData"]["path"][1:]}'
            new_info_key = f'{new_key}.info'
        except Exception as e:
            raise BadRequest(f'Failed to parse data: {e}')

        try:
            # Copy the file
            copy_source = {'Bucket': Config.OBJECT_STORE_BUCKET, 'Key': key}
            ObjectStoreStorageService().copy_file(copy_source, new_key)

            # Copy the file's info file
            copy_source['Key'] = info_key
            ObjectStoreStorageService().copy_file(copy_source, new_info_key)
        except Exception as e:
            raise BadGateway(f'Object store copy request failed: {e}')

        try:
            ObjectStoreStorageService().delete_file(key)
            ObjectStoreStorageService().delete_file(info_key)
        except Exception as e:
            raise BadGateway(f'Object store delete request failed: {e}')

        return 204