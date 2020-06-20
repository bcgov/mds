import uuid
import os
import requests
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


@api.route('/documents')
class DocumentListResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'folder', type=str, required=False, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=False,
        help=
        'The sub folder path to store the document in with the guids replaced for more readable names.'
    )
    parser.add_argument(
        'filename', type=str, required=False, help='File name + extension of the document.')

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        if request.headers.get('Tus-Resumable') is None:
            raise BadRequest('Received file upload for unsupported file transfer protocol')

        # Validate the file size
        file_size = request.headers.get('Upload-Length')
        if not file_size:
            raise BadRequest('Received file upload of unspecified size')
        file_size = int(file_size)
        max_file_size = Config.MAX_CONTENT_LENGTH
        if file_size > max_file_size:
            raise RequestEntityTooLarge(
                f'The maximum file upload size is {max_file_size/1024/1024}MB.')

        # Validate the file name and file type
        data = self.parser.parse_args()
        filename = data.get('filename') or request.headers.get('Filename')
        if not filename:
            raise BadRequest('File name cannot be empty')
        if filename.endswith(FORBIDDEN_FILETYPES):
            raise BadRequest('File type is forbidden')

        # Create the path string for this file
        document_guid = str(uuid.uuid4())
        base_folder = Config.UPLOADED_DOCUMENT_DEST
        folder = data.get('folder') or request.headers.get('Folder')
        folder = os.path.join(base_folder, folder)
        file_path = os.path.join(folder, document_guid)
        pretty_folder = data.get('pretty_folder') or request.headers.get('Pretty-Folder')
        pretty_path = os.path.join(base_folder, pretty_folder, filename)

        # If the object store is enabled, send the post request through to TUSD to the object store
        object_store_path = None
        if Config.OBJECT_STORE_ENABLED:
            resp = requests.post(
                url=Config.TUSD_URL,
                headers={key: value
                         for (key, value) in request.headers if key != 'Host'},
                data=request.data)

            if resp.status_code != requests.codes.created:
                message = f'Cannot upload file. Object store responded with {resp.status_code} ({resp.reason}): {resp._content}'
                current_app.logger.error(message)
                current_app.logger.error(f'POST resp:\n{resp.__dict__}')
                current_app.logger.error(f'POST resp.request:\n{resp.request.__dict__}')
                raise BadGateway(message)

            object_store_upload_resource = urlparse(resp.headers['Location']).path.split('/')[-1]
            object_store_path = Config.S3_PREFIX + object_store_upload_resource.split('+')[0]
            cache.set(
                OBJECT_STORE_UPLOAD_RESOURCE(document_guid), object_store_upload_resource,
                TIMEOUT_24_HOURS)
            cache.set(OBJECT_STORE_PATH(document_guid), object_store_path, TIMEOUT_24_HOURS)

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
        cache.set(FILE_UPLOAD_SIZE(document_guid), file_size, TIMEOUT_24_HOURS)
        cache.set(FILE_UPLOAD_OFFSET(document_guid), 0, TIMEOUT_24_HOURS)
        cache.set(FILE_UPLOAD_PATH(document_guid), file_path, TIMEOUT_24_HOURS)

        # Create document record
        document = Document(
            document_guid=document_guid,
            full_storage_path=file_path,
            upload_started_date=datetime.utcnow(),
            file_display_name=filename,
            path_display_name=pretty_path,
            object_store_path=object_store_path)
        document.save()

        # Create and send response
        response = make_response(jsonify(document_manager_guid=document_guid), 201)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Location'] = f'{Config.DOCUMENT_MANAGER_URL}/documents/{document_guid}'
        response.headers['Upload-Offset'] = 0
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Location,Upload-Offset'
        response.autocorrect_location_header = False
        return response

    def get(self):
        token_guid = request.args.get('token', '')
        as_attachment = request.args.get('as_attachment', None)
        document_guid = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))

        if not document_guid:
            raise BadRequest('Valid token required for download')

        document = Document.query.filter_by(document_guid=document_guid).first()
        if not document:
            raise NotFound('Could not find the document corresponding to the token')
        if as_attachment is not None:
            as_attachment = True if as_attachment == 'true' else False
        else:
            as_attachment = '.pdf' not in document.file_display_name.lower()

        if document.object_store_path:
            return ObjectStoreStorageService().download_file(
                path=document.object_store_path,
                display_name=document.file_display_name,
                as_attachment=as_attachment)
        else:
            return send_file(
                filename_or_fp=document.full_storage_path,
                attachment_filename=document.file_display_name,
                as_attachment=as_attachment)


@api.route(f'/documents/<string:document_guid>')
class DocumentResource(Resource):
    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def patch(self, document_guid):
        # Get and validate the file path (not required if object store is enabled)
        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))
        if not Config.OBJECT_STORE_ENABLED and (file_path is None
                                                or not os.path.lexists(file_path)):
            raise NotFound('File does not exist')

        # Get and validate the upload offset
        request_offset = int(request.headers.get('Upload-Offset', 0))
        file_offset = cache.get(FILE_UPLOAD_OFFSET(document_guid))
        if request_offset != file_offset:
            raise Conflict('Upload offset in request does not match the file\'s upload offset')

        # Get and validate the content length and the expected new upload offset
        chunk_size = request.headers.get('Content-Length')
        if chunk_size is None:
            raise BadRequest('No Content-Length header in request')
        chunk_size = int(chunk_size)
        new_offset = file_offset + chunk_size
        file_size = cache.get(FILE_UPLOAD_SIZE(document_guid))
        if new_offset > file_size:
            raise RequestEntityTooLarge(
                'The uploaded chunk would put the file above its declared file size')

        # If the object store is enabled, send the patch request through to TUSD to the object store
        if Config.OBJECT_STORE_ENABLED:
            object_store_upload_resource = cache.get(OBJECT_STORE_UPLOAD_RESOURCE(document_guid))
            headers = {key: value for (key, value) in request.headers if key != 'Host'}
            headers['content-type'] = 'application/offset+octet-stream'
            resp = requests.patch(
                url=f'{Config.TUSD_URL}/{object_store_upload_resource}',
                headers=headers,
                data=request.data)

            current_app.logger.error(f'PATCH request.headers:\n{request.headers.__dict__}')
            current_app.logger.error(f'PATCH headers:\n{headers}')
            current_app.logger.error(f'PATCH resp:\n{resp.__dict__}')
            current_app.logger.error(f'PATCH resp.request:\n{resp.request.__dict__}')

            if resp.status_code not in [requests.codes.ok, requests.codes.no_content]:
                message = f'Cannot upload file. Object store responded with {resp.status_code} ({resp.reason}): {resp._content}'
                current_app.logger.error(message)
                # current_app.logger.error(f'PATCH resp:\n{resp.__dict__}')
                # current_app.logger.error(f'PATCH resp.request:\n{resp.request.__dict__}')
                raise BadGateway(message)

        # Else, write the content to the file in the file system
        else:
            try:
                with open(file_path, 'r+b') as f:
                    f.seek(file_offset)
                    f.write(request.data)
            except IOError as e:
                current_app.logger.error(e)
                raise InternalServerError('Unable to write to file')

        # If the file upload is complete, set the upload completion date and delete cached data
        if new_offset == file_size:
            document = Document.find_by_document_guid(document_guid)
            document.upload_completed_date = datetime.utcnow()
            document.save()
            cache.delete(FILE_UPLOAD_SIZE(document_guid))
            cache.delete(FILE_UPLOAD_OFFSET(document_guid))
            cache.delete(FILE_UPLOAD_PATH(document_guid))
            cache.delete(OBJECT_STORE_PATH(document_guid))
            cache.delete(OBJECT_STORE_UPLOAD_RESOURCE(document_guid))

        # Else, the file upload is still in progress, update its upload offset in the cache
        else:
            cache.set(FILE_UPLOAD_OFFSET(document_guid), new_offset, TIMEOUT_24_HOURS)

        response = make_response('', 204)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = new_offset
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Upload-Offset'
        return response

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def head(self, document_guid):
        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))
        if file_path is None or not os.path.lexists(file_path):
            raise NotFound('File does not exist')

        response = make_response('', 200)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = cache.get(FILE_UPLOAD_OFFSET(document_guid))
        response.headers['Upload-Length'] = cache.get(FILE_UPLOAD_SIZE(document_guid))
        response.headers['Cache-Control'] = 'no-store'
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Upload-Offset,Upload-Length,Cache-Control'
        return response

    def options(self, document_guid):
        response = make_response('', 200)

        # If CORS request, return an empty 200 response
        if request.headers.get('Access-Control-Request-Method') is not None:
            return response

        response.headers['Tus-Resumable'] = self.tus_api_version
        response.headers['Tus-Version'] = self.tus_api_supported_versions
        response.headers['Tus-Extension'] = 'creation'
        response.headers['Tus-Max-Size'] = self.max_file_size
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Tus-Extension,Tus-Max-Size'
        response.status_code = 204
        return response
