import base64
import os
import time
from urllib.parse import urlparse
from wsgiref.handlers import format_date_time

import requests
from app.config import Config
from app.constants import OBJECT_STORE_PATH, OBJECT_STORE_UPLOAD_RESOURCE, FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, \
    FILE_UPLOAD_PATH, FILE_UPLOAD_EXPIRY, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, \
    FORBIDDEN_FILETYPES
from app.extensions import cache
from flask import request, current_app, make_response, jsonify
from werkzeug.exceptions import BadRequest, NotFound, RequestEntityTooLarge, InternalServerError, BadGateway

CACHE_TIMEOUT = TIMEOUT_24_HOURS


class DocumentUploadHelper:

    @classmethod
    def initiate_document_upload(cls, document_guid, file_path, folder, file_size, version_guid=None):
        # If the object store is enabled, send the post request through to TUSD to the object store
        object_store_path = None
        if Config.OBJECT_STORE_ENABLED:

            # Add the path to be used in the post-finish tusd hook to set the correct object store path
            headers = {key: value for (
                key, value) in request.headers if key != 'Host'}
            path = base64.b64encode(file_path.encode('utf-8')).decode('utf-8')
            doc_guid = base64.b64encode(
                document_guid.encode('utf-8')).decode('utf-8')
            upload_metadata = request.headers['Upload-Metadata']
            headers['Upload-Metadata'] = f'{upload_metadata},path {path},doc_guid {doc_guid}'

            if version_guid is not None:
                ver_guid = base64.b64encode(
                    str(version_guid).encode('utf-8')).decode('utf-8')

                headers['Upload-Metadata'] = headers['Upload-Metadata'] + \
                    f',version_guid {ver_guid}'

            # Send the request
            resp = None
            try:
                resp = requests.post(url=Config.TUSD_URL,
                                     headers=headers, data=request.data)
            except Exception as e:
                message = f'POST request to object store raised an exception:\n{e}'
                current_app.logger.error(message)
                raise InternalServerError(message)

            # Validate the request
            if resp.status_code != requests.codes.created:
                message = f'POST request to object store failed: {resp.status_code} ({resp.reason}): {resp._content}'
                current_app.logger.error(
                    f'POST resp.request:\n{resp.request.__dict__}')
                current_app.logger.error(f'POST resp:\n{resp.__dict__}')
                current_app.logger.error(message)
                if resp.status_code == requests.codes.not_found:
                    raise NotFound(message)
                raise BadGateway(message)

            # Set object store upload data in cache
            object_store_upload_resource = urlparse(
                resp.headers['Location']).path.split('/')[-1]
            object_store_path = Config.S3_PREFIX + \
                object_store_upload_resource.split('+')[0]
            cache.set(
                OBJECT_STORE_UPLOAD_RESOURCE(
                    document_guid), object_store_upload_resource,
                CACHE_TIMEOUT)
            cache.set(OBJECT_STORE_PATH(document_guid),
                      object_store_path, CACHE_TIMEOUT)

        # Else, create an empty file at this path in the file system
        else:
            try:
                if not os.path.exists(folder):
                    os.makedirs(folder)
                with open(file_path, 'wb') as f:
                    f.seek(file_size - 1)
                    f.write(b'\0')
            except IOError as e:
                current_app.logger.error(e)
                raise InternalServerError('Unable to create file')

        # Cache data to be used in future PATCH requests
        upload_expiry = format_date_time(time.time() + CACHE_TIMEOUT)
        cache.set(FILE_UPLOAD_EXPIRY(document_guid),
                  upload_expiry, CACHE_TIMEOUT)
        cache.set(FILE_UPLOAD_SIZE(document_guid), file_size, CACHE_TIMEOUT)
        cache.set(FILE_UPLOAD_OFFSET(document_guid), 0, CACHE_TIMEOUT)
        cache.set(FILE_UPLOAD_PATH(document_guid), file_path, CACHE_TIMEOUT)

        # Create and send response
        response = make_response(
            jsonify(document_manager_guid=document_guid), 201)

        if version_guid is not None:
            response = make_response(
                jsonify(document_manager_guid=document_guid, document_manager_version_guid=version_guid), 201)

        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Location'] = f'{Config.DOCUMENT_MANAGER_URL}/documents/{document_guid}'
        response.headers['Upload-Offset'] = 0
        response.headers['Upload-Expires'] = upload_expiry
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Location,Upload-Offset,Upload-Expires,Content-Type'
        if version_guid is not None:
            response.headers['Document-Version'] = version_guid
            response.headers[
                'Access-Control-Expose-Headers'] = response.headers[
                'Access-Control-Expose-Headers'] + ',Document-Version'

        response.autocorrect_location_header = False

        return response, object_store_path

    @ classmethod
    def parse_and_validate_uploaded_file(cls, data):
        """
        Parses and validates the given parsed request data
        to make sure the file and the associated metadata is
        Tusd compatible and matches files that the system can accept
        """
        if request.headers.get('Tus-Resumable') is None:
            raise BadRequest(
                'Received file upload for unsupported file transfer protocol')

        # Validate the file size
        file_size = request.headers.get('Upload-Length')
        if not file_size:
            raise BadRequest('Received file upload of unspecified size')
        file_size = int(file_size)
        max_file_size = Config.MAX_CONTENT_LENGTH
        if file_size > max_file_size:
            raise RequestEntityTooLarge(
                f'The maximum file upload size is {max_file_size / 1024 / 1024}MB.')

        # Validate the file name and file type
        filename = data.get('filename') or request.headers.get('Filename')
        if not filename:
            raise BadRequest('File name cannot be empty')
        if filename.endswith(FORBIDDEN_FILETYPES):
            raise BadRequest('File type is forbidden')
        return file_size, data, filename
