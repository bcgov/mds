import uuid
import os
from datetime import datetime

from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError
from flask import request, current_app, send_file, make_response, jsonify
from flask_restplus import Resource, reqparse

from app.models.document import Document
from app.extensions import api, cache
from app.utils.access_decorators import requires_any_of, MINE_EDIT, VIEW_ALL, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE
from app.constants import FILE_UPLOAD_SIZE, FILE_UPLOAD_OFFSET, FILE_UPLOAD_PATH, DOWNLOAD_TOKEN, TIMEOUT_24_HOURS, TUS_API_VERSION, TUS_API_SUPPORTED_VERSIONS, FORBIDDEN_FILETYPES


@api.route('/documents')
class DocumentListResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'folder', type=str, required=True, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=True,
        help=
        'The sub folder path to store the document in with the guids replaced for more readable names.'
    )
    parser.add_argument(
        'filename', type=str, required=True, help='File name + extension of the document.')

    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def post(self):
        """ 
        
        :raises BadRequest: [description]
        :return: [description]
        :rtype: [type]
        """

        if request.headers.get('Tus-Resumable') is None:
            raise BadRequest('Received file upload for unsupported file transfer protocol')

        document_guid = DocumentService.begin_tus_upload(request)

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
        document_guid = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))

        if not document_guid:
            raise BadRequest('Valid token required for download')

        doc = Document.query.filter_by(document_guid=document_guid).first()
        if not doc:
            raise NotFound('Could not find the document corresponding to the token')
        current_app.logger.debug(attachment)
        if attachment is not None:
            as_attachment = True if attachment == 'true' else False
        else:
            as_attachment = '.pdf' not in doc.file_display_name.lower()

        return DocumentService.download_file(document_guid, as_attachment)


@api.route(f'/documents/<string:document_guid>')
class DocumentResource(Resource):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'folder', type=str, required=True, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=True,
        help=
        'The sub folder path to store the document in with the guids replaced for more readable names.'
    )
    parser.add_argument(
        'filename', type=str, required=True, help='File name + extension of the document.')

    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def patch(self, document_guid):
        """ 
        Used for tus resumable file uploads, requires the initial uploaded file guid.
        """

        DocumentService.resume_tus_upload()

    
    @requires_any_of(
        [MINE_EDIT, EDIT_PARTY, EDIT_PERMIT, EDIT_DO, EDIT_VARIANCE, MINESPACE_PROPONENT])
    def head(self, document_guid):
        if document_guid is None:
            raise BadRequest('Must specify document GUID in HEAD')

        file_path = cache.get(FILE_UPLOAD_PATH(document_guid))

        # Begin file exists
        if file_path is None or not os.path.lexists(file_path):
            raise NotFound('File does not exist')
        # End file exists

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
