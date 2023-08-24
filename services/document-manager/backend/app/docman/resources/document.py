import uuid
import os
import requests
import base64
import time
import json

from datetime import datetime
from wsgiref.handlers import format_date_time
from urllib.parse import urlparse, quote

from app.docman.utils.document_upload_helper import DocumentUploadHelper
from app.services.object_store_storage_service import ObjectStoreStorageService

from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError, BadGateway
from flask import request, current_app, send_file, make_response, jsonify
from flask_restx import Resource, reqparse, marshal_with

from app.docman.models.document import Document
from app.extensions import api, cache
from app.docman.response_models import DOCUMENT_MODEL
from app.utils.access_decorators import requires_any_of, DOCUMENT_UPLOAD_ROLES, VIEW_ALL, MINESPACE_PROPONENT, GIS
from app.constants import OBJECT_STORE_PATH, OBJECT_STORE_UPLOAD_RESOURCE, FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, FILE_UPLOAD_PATH, FILE_UPLOAD_EXPIRY, DOWNLOAD_TOKEN, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, FORBIDDEN_FILETYPES
from app.config import Config

CACHE_TIMEOUT = TIMEOUT_24_HOURS


@api.route('/documents')
class DocumentListResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'folder', type=str, required=False, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=False,
        help='The sub folder path to store the document in with the guids replaced for more readable names.'
    )
    parser.add_argument(
        'filename', type=str, required=False, help='File name + extension of the document.')

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def post(self):
        file_size, data, filename = DocumentUploadHelper().parse_and_validate_uploaded_file(
            self.parser.parse_args())

        # Create the path string for this file
        document_guid = str(uuid.uuid4())
        base_folder = Config.UPLOADED_DOCUMENT_DEST
        folder = data.get('folder') or request.headers.get('Folder')
        folder = os.path.join(base_folder, folder)
        file_path = os.path.join(folder, document_guid)
        pretty_folder = data.get(
            'pretty_folder') or request.headers.get('Pretty-Folder')
        pretty_path = os.path.join(base_folder, pretty_folder, filename)

        response, object_store_path = DocumentUploadHelper.initiate_document_upload(
            document_guid=document_guid,
            file_path=file_path,
            folder=folder,
            file_size=file_size)

        # Create document record
        document = Document(
            document_guid=document_guid,
            full_storage_path=file_path,
            upload_started_date=datetime.utcnow(),
            file_display_name=filename,
            path_display_name=pretty_path,
            object_store_path=object_store_path)
        document.save()

        return response

    def get(self):
        token_guid = request.args.get('token', '')
        as_attachment = request.args.get('as_attachment', None)
        document_guid = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))

        if not document_guid:
            raise BadRequest('Valid token required for download')

        document = Document.query.filter_by(document_guid=document_guid).one_or_none()
        if not document:
            raise NotFound('Could not find the document corresponding to the token')
        if as_attachment is not None:
            as_attachment = True if as_attachment == 'true' else False
        else:
            as_attachment = '.pdf' not in document.file_display_name.lower()

        if document.object_store_path:
            return ObjectStoreStorageService().download_file(
                path=document.object_store_path,
                display_name=quote(document.file_display_name),
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

        # Get the "upload expires" header value
        upload_expiry = cache.get(FILE_UPLOAD_EXPIRY(document_guid))
        if upload_expiry is None:
            raise NotFound(
                f'Cached file upload data (upload_expiry) not found')

        # Get and validate the upload offset
        request_offset = int(request.headers.get('Upload-Offset', 0))
        file_offset = cache.get(FILE_UPLOAD_OFFSET(document_guid))
        if file_offset is None:
            raise NotFound(f'Cached file upload data (file_offset) not found')
        if request_offset != file_offset:
            raise Conflict(
                'Upload offset in request does not match the file\'s upload offset')

        # Get and validate the content length and the expected new upload offset
        chunk_size = request.headers.get('Content-Length')
        if chunk_size is None:
            raise BadRequest('No Content-Length header in request')
        chunk_size = int(chunk_size)
        new_offset = file_offset + chunk_size
        file_size = cache.get(FILE_UPLOAD_SIZE(document_guid))
        if file_size is None:
            raise NotFound(f'Cached file upload data (file_size) not found')
        if new_offset > file_size:
            raise Conflict(
                'The uploaded chunk would put the file above its declared file size')

        # If the object store is enabled, send the patch request through to TUSD to the object store
        if Config.OBJECT_STORE_ENABLED:
            object_store_upload_resource = cache.get(
                OBJECT_STORE_UPLOAD_RESOURCE(document_guid))
            if object_store_upload_resource is None:
                raise NotFound(
                    f'Cached file upload data (object_store_upload_resource) not found')

            # Send the request
            resp = None
            try:
                url = f'{Config.TUSD_URL}{object_store_upload_resource}'
                headers = {key: value for (
                    key, value) in request.headers if key != 'Host'}
                resp = requests.patch(
                    url=url, headers=headers, data=request.data)
            except Exception as e:
                message = f'PATCH request to object store raised an exception:\n{e}'
                current_app.logger.error(message)
                raise InternalServerError(message)

            # Validate the request
            if resp.status_code not in [requests.codes.ok, requests.codes.no_content]:
                message = f'PATCH request to object store failed: {resp.status_code} ({resp.reason}): {resp._content}'
                current_app.logger.error(
                    f'PATCH resp.request:\n{resp.request.__dict__}')
                current_app.logger.error(f'PATCH resp:\n{resp.__dict__}')
                current_app.logger.error(message)
                if resp.status_code == requests.codes.not_found:
                    raise NotFound(message)
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

            cache.delete(FILE_UPLOAD_EXPIRY(document_guid))
            cache.delete(FILE_UPLOAD_SIZE(document_guid))
            cache.delete(FILE_UPLOAD_OFFSET(document_guid))
            cache.delete(FILE_UPLOAD_PATH(document_guid))
            cache.delete(OBJECT_STORE_PATH(document_guid))
            cache.delete(OBJECT_STORE_UPLOAD_RESOURCE(document_guid))

        # Else, the file upload is still in progress, update its upload offset in the cache
        else:
            cache.set(FILE_UPLOAD_OFFSET(document_guid),
                      new_offset, CACHE_TIMEOUT)

        response = make_response('', 204)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = new_offset
        response.headers['Upload-Expires'] = upload_expiry
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Upload-Offset,Upload-Expires'
        return response

    @requires_any_of(DOCUMENT_UPLOAD_ROLES)
    def head(self, document_guid):
        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))
        object_store_upload_resource = cache.get(
            OBJECT_STORE_UPLOAD_RESOURCE(document_guid))

        # If the object store is enabled, validate the file exists with the object store
        if Config.OBJECT_STORE_ENABLED:
            if object_store_upload_resource is None:
                raise NotFound(
                    f'Cached file upload data (object_store_upload_resource) not found')

            # Send the request
            resp = None
            try:
                url = f'{Config.TUSD_URL}{object_store_upload_resource}'
                headers = {key: value for (
                    key, value) in request.headers if key != 'Host'}
                resp = requests.head(
                    url=url, headers=headers, data=request.data)
            except Exception as e:
                message = f'HEAD request to object store raised an exception:\n{e}'
                current_app.logger.error(message)
                raise InternalServerError(message)

            # Validate the request
            if resp.status_code != requests.codes.ok:
                message = f'HEAD request to object store failed: {resp.status_code} ({resp.reason}): {resp._content}'
                current_app.logger.error(
                    f'HEAD resp.request:\n{resp.request.__dict__}')
                current_app.logger.error(f'HEAD resp:\n{resp.__dict__}')
                current_app.logger.error(message)
                if resp.status_code == requests.codes.not_found:
                    raise NotFound(message)
                raise BadGateway(message)

        # Else, check that the file exists on the filesystem
        elif file_path is None or not os.path.lexists(file_path):
            raise NotFound('File does not exist')

        response = make_response('', 200)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = cache.get(
            FILE_UPLOAD_OFFSET(document_guid))
        response.headers['Upload-Length'] = cache.get(
            FILE_UPLOAD_SIZE(document_guid))
        response.headers['Upload-Expires'] = cache.get(
            FILE_UPLOAD_EXPIRY(document_guid))
        response.headers['Cache-Control'] = 'no-store'
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Upload-Offset,Upload-Length,Upload-Expires,Cache-Control'
        return response

    def options(self, document_guid):
        response = make_response('', 200)

        # If CORS request, return an empty 200 response
        if request.headers.get('Access-Control-Request-Method') is not None:
            return response

        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Tus-Extension'] = 'creation,expiration'
        response.headers[
            'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Tus-Extension,Tus-Max-Size'
        response.status_code = 204
        return response

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, GIS])
    @api.marshal_with(DOCUMENT_MODEL, code=200)
    def get(self, document_guid):
        document = Document.query.filter_by(
            document_guid=document_guid).one_or_none()
        if not document:
            raise NotFound('Document not found')
        return document

    @api.route('/documents/zip', methods=['POST'])
    class DocumentZipResource(Resource):
        @requires_any_of(DOCUMENT_UPLOAD_ROLES)
        def post(self):
            from app.services.commands_helper import create_zip_task
            document_manager_guids = request.json.get('document_manager_guids', [])
            zip_file_name = request.json.get('zip_file_name', None)
            
            if not zip_file_name:
                raise BadRequest('No file name provided')

            if not document_manager_guids:
                raise BadRequest('No document guids provided')

            response = create_zip_task(zip_file_name, document_manager_guids)

            return jsonify(response)
        
    @api.route('/documents/zip/<task_id>', methods=['GET'])
    class ZipDocsProgressResource(Resource):
        def get(self, task_id=None):
            from app.tasks.celery import get_task
            
            if not task_id:
                raise BadRequest('No task id provided')
            task = get_task(task_id)
            
            if not task:
                raise BadRequest('No task found')
            
            if task.state == 'PENDING':
                response = {
                    'state': task.state,
                    'progress': 0
                }
            elif task.state == 'SUCCESS':
                success_docs = json.loads(task.info).get('success_docs', '[]')
                response = {
                    'state': task.state,
                    'progress': 100,
                    'success_docs': success_docs,
                }
            elif task.state == 'FAILURE':
                response = {
                    'state': task.state,
                    'progress': 0,
                    'error': str(task.result)
                }
            else:
                progress = task.info.get('progress', 0)                
                                
                response = {
                    'state': task.state,
                    'progress': progress,
                }
            return jsonify(response)
