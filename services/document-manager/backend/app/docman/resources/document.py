import uuid
import os
from datetime import datetime

from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError
from flask import request, current_app, send_file, make_response, jsonify
from flask_restplus import Resource, reqparse

from app.docman.models.document import Document
from app.extensions import api, cache
from app.utils.access_decorators import requires_any_of, MINE_EDIT, VIEW_ALL, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE
from app.constants import FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, FILE_UPLOAD_PATH, DOWNLOAD_TOKEN, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, FORBIDDEN_FILETYPES


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

    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def post(self):
        if request.headers.get('Tus-Resumable') is None:
            raise BadRequest('Received file upload for unsupported file transfer protocol')

        file_size = request.headers.get('Upload-Length')
        max_file_size = current_app.config["MAX_CONTENT_LENGTH"]
        if not file_size:
            raise BadRequest('Received file upload of unspecified size')
        file_size = int(file_size)
        if file_size > max_file_size:
            raise RequestEntityTooLarge(
                f'The maximum file upload size is {max_file_size/1024/1024}MB.')

        data = self.parser.parse_args()
        filename = data.get('filename') or request.headers.get('Filename')
        if not filename:
            raise BadRequest('File name cannot be empty')
        if filename.endswith(FORBIDDEN_FILETYPES):
            raise BadRequest('File type is forbidden')

        document_guid = str(uuid.uuid4())
        base_folder = current_app.config['UPLOADED_DOCUMENT_DEST']
        folder = data.get('folder') or request.headers.get('Folder')
        folder = os.path.join(base_folder, folder)
        file_path = os.path.join(folder, document_guid)
        pretty_folder = data.get('pretty_folder') or request.headers.get('Pretty-Folder')
        pretty_path = os.path.join(base_folder, pretty_folder, filename)

        try:
            if not os.path.exists(folder):
                os.makedirs(folder)
            with open(file_path, "wb") as f:
                f.seek(file_size - 1)
                f.write(b"\0")
        except IOError as e:
            raise InternalServerError('Unable to create file')

        cache.set(FILE_UPLOAD_SIZE(document_guid), file_size, TIMEOUT_24_HOURS)
        cache.set(FILE_UPLOAD_OFFSET(document_guid), 0, TIMEOUT_24_HOURS)
        cache.set(FILE_UPLOAD_PATH(document_guid), file_path, TIMEOUT_24_HOURS)

        document_info = Document(
            document_guid=document_guid,
            full_storage_path=file_path,
            upload_started_date=datetime.utcnow(),
            file_display_name=filename,
            path_display_name=pretty_path,
        )
        document_info.save()

        response = make_response(jsonify(document_manager_guid=document_guid), 201)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers[
            'Location'] = f'{current_app.config["DOCUMENT_MANAGER_URL"]}/documents/{document_guid}'
        response.headers['Upload-Offset'] = 0
        response.headers[
            'Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Location,Upload-Offset"
        response.autocorrect_location_header = False
        return response

    def get(self):
        token_guid = request.args.get('token', '')
        attachment = request.args.get('as_attachment', None)
        doc_guid = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))

        if not doc_guid:
            raise BadRequest('Valid token required for download')

        doc = Document.query.filter_by(document_guid=doc_guid).first()
        if not doc:
            raise NotFound('Could not find the document corresponding to the token')
        if attachment is not None:
            attach_style = True if attachment == 'true' else False
        else:
            attach_style = '.pdf' not in doc.file_display_name.lower()

        return send_file(
            filename_or_fp=doc.full_storage_path,
            attachment_filename=doc.file_display_name,
            as_attachment=attach_style)


@api.route(f'/documents/<string:document_guid>')
class DocumentResource(Resource):
    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def patch(self, document_guid):
        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))
        if file_path is None or not os.path.lexists(file_path):
            raise NotFound('PATCH sent for a upload that does not exist')

        request_offset = int(request.headers.get('Upload-Offset', 0))
        file_offset = cache.get(FILE_UPLOAD_OFFSET(document_guid))
        if request_offset != file_offset:
            raise Conflict("Offset in request does not match uploaded file's offset")

        chunk_size = request.headers.get('Content-Length')
        if chunk_size is None:
            raise BadRequest('No Content-Length header in request')
        chunk_size = int(chunk_size)

        new_offset = file_offset + chunk_size
        file_size = cache.get(FILE_UPLOAD_SIZE(document_guid))
        if new_offset > file_size:
            raise RequestEntityTooLarge(
                'The uploaded chunk would put the file above its declared file size.')

        try:
            with open(file_path, "r+b") as f:
                f.seek(file_offset)
                f.write(request.data)
        except IOError as e:
            raise InternalServerError('Unable to write to file')

        if new_offset == file_size:
            # File transfer complete.
            doc = Document.find_by_document_guid(document_guid)
            doc.upload_completed_date = datetime.utcnow()
            doc.save()

            cache.delete(FILE_UPLOAD_SIZE(document_guid))
            cache.delete(FILE_UPLOAD_OFFSET(document_guid))
            cache.delete(FILE_UPLOAD_PATH(document_guid))
        else:
            # File upload still in progress
            cache.set(FILE_UPLOAD_OFFSET(document_guid), new_offset, TIMEOUT_24_HOURS)

        response = make_response('', 204)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = new_offset
        response.headers[
            'Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Upload-Offset"
        return response

    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def head(self, document_guid):
        if document_guid is None:
            raise BadRequest('Must specify document GUID in HEAD')

        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))
        if file_path is None or not os.path.lexists(file_path):
            raise NotFound('File does not exist')

        response = make_response("", 200)
        response.headers['Tus-Resumable'] = TUS_API_VERSION
        response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
        response.headers['Upload-Offset'] = cache.get(FILE_UPLOAD_OFFSET(document_guid))
        response.headers['Upload-Length'] = cache.get(FILE_UPLOAD_SIZE(document_guid))
        response.headers['Cache-Control'] = 'no-store'
        response.headers[
            'Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Upload-Offset,Upload-Length,Cache-Control"
        return response

    def options(self, document_guid):
        response = make_response('', 200)

        if request.headers.get('Access-Control-Request-Method', None) is not None:
            # CORS request, return 200
            return response

        response.headers['Tus-Resumable'] = self.tus_api_version
        response.headers['Tus-Version'] = self.tus_api_supported_versions
        response.headers['Tus-Extension'] = "creation"
        response.headers['Tus-Max-Size'] = self.max_file_size
        response.headers[
            'Access-Control-Expose-Headers'] = "Tus-Resumable,Tus-Version,Tus-Extension,Tus-Max-Size"
        response.status_code = 204
        return response
