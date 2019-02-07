import decimal
import uuid
import os
import re
from datetime import datetime
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from flask import request, current_app, send_file, make_response, jsonify
from flask_restplus import Resource, reqparse

from ..models.document_manager import DocumentManager
from app.extensions import api, cache
from ...utils.resources_mixins import UserMixin, ErrorMixin
from ...utils.access_decorators import requires_any_of, MINE_CREATE, MINE_VIEW, MINESPACE_PROPONENT
from app.api.constants import TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, FORBIDDEN_FILETYPES


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'folder', type=str, required=True, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=True,
        help='The sub folder path to store the document in with the guids replaced for more readable names.'
    )
    parser.add_argument(
        'filename', type=str, required=True, help='File name + extension of the document.')

    def redis_key_file_size(self, id): return f'document-manager/{id}/file-size'
    def redis_key_offset(self, id): return f'document-manager/{id}/offset'
    def redis_key_file_path(self, id): return f'document-manager/{id}/file-path'

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self):
        if request.headers.get('Tus-Resumable') is None:
            return self.create_error_payload(400, 'Received file upload for unsupported file transfer protocol'), 400

        file_size = request.headers.get('Upload-Length')
        max_file_size = current_app.config["MAX_CONTENT_LENGTH"]
        if not file_size:
            return self.create_error_payload(400, 'Received file upload of unspecified size'), 400
        file_size = int(file_size)
        if file_size > max_file_size:
            return self.create_error_payload(413, f'The maximum file upload size is {max_file_size/1024/1024}MB.'), 413

        data = self.parser.parse_args()
        filename = data.get('filename')
        if not filename:
            return self.create_error_payload(400, 'File name cannot be empty'), 400
        if filename.endswith(FORBIDDEN_FILETYPES):
            return self.create_error_payload(400, 'File type is forbidden'), 400

        document_guid = str(uuid.uuid4())
        base_folder = current_app.config['UPLOADED_DOCUMENT_DEST']
        folder = data.get('folder')
        folder = os.path.join(base_folder, folder)
        file_path = os.path.join(folder, document_guid)
        pretty_folder = data.get('pretty_folder')
        pretty_path = os.path.join(base_folder, pretty_folder, filename)

        try:
            if not os.path.exists(folder):
                os.makedirs(folder)
            with open(file_path, "wb") as f:
                f.write(b"\0")
        except IOError as e:
            return self.create_error_payload(500, f'Unable to create file:{str(e)}'), 500

        cache.set(self.redis_key_file_size(document_guid),
                  file_size, TIMEOUT_24_HOURS)
        cache.set(self.redis_key_offset(document_guid), 0, TIMEOUT_24_HOURS)
        cache.set(self.redis_key_file_path(document_guid),
                  file_path, TIMEOUT_24_HOURS)

        document_info = DocumentManager(
            document_guid=document_guid,
            full_storage_path=file_path,
            upload_started_date=datetime.now(),
            file_display_name=filename,
            path_display_name=pretty_path,
            **self.get_create_update_dict(),
        )
        document_info.save()

        response = make_response(
            jsonify(document_manager_guid=document_guid), 201)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Location'] = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/document-manager/{document_guid}'
        response.headers['Upload-Offset'] = 0
        response.headers['Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Location,Upload-Offset"
        response.autocorrect_location_header = False
        return response

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def patch(self, document_guid=None):
        if document_guid is None:
            return self.create_error_payload(400, 'Must specify document GUID in PATCH'), 400

        file_path = cache.get(self.redis_key_file_path(document_guid))
        if file_path is None or not os.path.lexists(file_path):
            return self.create_error_payload(404, 'PATCH sent for a upload that does not exist'), 404

        request_offset = int(request.headers.get('Upload-Offset', 0))
        file_offset = cache.get(self.redis_key_offset(document_guid))
        if request_offset != file_offset:
            return self.create_error_payload(409, "Offset in request does not match uploaded file's offest"), 409

        chunk_size = request.headers.get('Content-Length')
        if chunk_size is None:
            return self.create_error_payload(400, 'No Content-Length header in request'), 400
        chunk_size = int(chunk_size)

        new_offset = file_offset + chunk_size
        file_size = cache.get(self.redis_key_file_size(document_guid))
        if new_offset > file_size:
            return self.create_error_payload(413, 'The uploaded chunk would put the file above its declared file size.'), 413

        try:
            with open(file_path, "r+b") as f:
                f.seek(file_offset)
                f.write(request.data)
        except IOError as e:
            return self.create_error_payload(500, 'Unable to write to file'), 500

        if new_offset == file_size:
            # File transfer complete.
            doc = DocumentManager.find_by_document_manager_guid(document_guid)
            doc.upload_completed_date = datetime.now()
            doc.save()

            cache.delete(self.redis_key_file_size(document_guid))
            cache.delete(self.redis_key_offset(document_guid))
            cache.delete(self.redis_key_file_path(document_guid))
        else:
            # File upload still in progress
            cache.set(self.redis_key_offset(document_guid),
                      new_offset, TIMEOUT_24_HOURS)

        response = make_response("", 204)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = new_offset
        response.headers['Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Upload-Offset"
        return response

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def head(self, document_guid):
        if document_guid is None:
            return self.create_error_payload(400, 'Must specify document GUID in HEAD'), 400

        file_path = cache.get(self.redis_key_file_path(document_guid))
        if file_path is None or not os.path.lexists(file_path):
            return self.create_error_payload(404, 'File does not exist'), 404

        response = make_response("", 200)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = cache.get(
            self.redis_key_offset(document_guid))
        response.headers['Upload-Length'] = cache.get(
            self.redis_key_file_size(document_guid))
        response.headers['Cache-Control'] = 'no-store'
        response.headers['Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Upload-Offset,Upload-Length,Cache-Control"
        return response

    @api.doc(params={
        'document_guid': 'Required: Document guid. Returns the file associated to this guid.'
    })
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self, document_guid=None):
        if not document_guid:
            return self.create_error_payload(400, 'Must provide a document guid.'), 400

        document_manager_doc = DocumentManager.find_by_document_manager_guid(
            document_guid)

        if not document_manager_doc:
            return self.create_error_payload(
                404, f'Could not find a document with the document guid: {document_guid}'), 404
        else:
            return send_file(
                filename_or_fp=document_manager_doc.full_storage_path,
                attachment_filename=document_manager_doc.file_display_name,
                as_attachment=True)

    def options(self, document_guid):
        response = make_response('', 200)

        if request.headers.get('Access-Control-Request-Method', None) is not None:
            # CORS request, return 200
            return response

        response.headers['Tus-Resumable'] = self.tus_api_version
        response.headers['Tus-Version'] = self.tus_api_supported_versions
        response.headers['Tus-Extension'] = "creation,termination"
        response.headers['Tus-Max-Size'] = self.max_file_size
        response.headers['Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Tus-Extension,Tus-Max-Size"
        response.status_code = 204
        return response
