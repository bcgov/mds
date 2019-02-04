import decimal
import uuid
import os
import re
from datetime import datetime
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from flask import request, current_app, send_file
from flask_restplus import Resource, reqparse
from flask_uploads import UploadNotAllowed

from ..models.document_manager import DocumentManager
from app.extensions import api, documents
from ...utils.resources_mixins import UserMixin, ErrorMixin
from ...utils.access_decorators import requires_any_of, MINE_CREATE, MINE_VIEW, MINESPACE_PROPONENT


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('file', type=FileStorage, location='files', action='append')
    parser.add_argument(
        'folder', type=str, required=True, help='The sub folder path to store the document in.')
    parser.add_argument(
        'pretty_folder',
        type=str,
        required=True,
        help=
        'The sub folder path to store the document in with the guids replaced for more readable names.'
    )

    @requires_any_of([MINE_CREATE, MINESPACE_PROPONENT])
    def post(self):

        try:
            data = self.parser.parse_args()

        except exceptions.RequestEntityTooLarge:
            return ({
                'errors': [{
                    'message':
                    f'The maximum file upload size is {current_app.config["MAX_CONTENT_LENGTH"]/1024/1024}MB please ensure all files are this size.',
                }]
            })

        folder = data['folder']
        pretty_folder = data['pretty_folder']
        document_dict = {}
        errors = []

        for upload in data['file']:
            try:
                file_guid = uuid.uuid4()
                original_file_name, file_extension = os.path.splitext(upload.filename)

                upload_response = documents.save(upload, folder, (str(file_guid) + file_extension))
                real_path = documents.path(upload_response)
                filename = (original_file_name + file_extension)

                #create the readable path by removing the guids and replacing them with the more readable versions.
                pretty_path = re.sub(r'\b' + folder + r'\b', pretty_folder, real_path)
                pretty_path = re.sub(r'\b' + str(file_guid) + r'\b', original_file_name,
                                     pretty_path)

                document_info = DocumentManager(
                    document_guid=file_guid,
                    full_storage_path=real_path,
                    upload_date=datetime.now(),
                    file_display_name=filename,
                    path_display_name=pretty_path,
                    **self.get_create_update_dict(),
                )

                document_info.save()
                document_dict[str(file_guid)] = filename

            except UploadNotAllowed as e:
                errors.append({
                    'message':
                    f'The type of the file: {original_file_name + file_extension} is not allowed.',
                })
                continue

            except Exception as e:
                errors.append({
                    'message': 'An unexpected error has occured: ' + str(e),
                })
                continue

        return {
            'status': 200,
            'document_manager_guids': document_dict,
            'errors': errors,
        }

    @api.doc(params={
        'document_guid': 'Required: Document guid. Returns the file associated to this guid.'
    })
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self, document_guid=None):

        if not document_guid:
            return self.create_error_payload(400, 'Must provide a document guid.'), 400

        document_manager_doc = DocumentManager.find_by_document_manager_guid(document_guid)

        if not document_manager_doc:
            return self.create_error_payload(
                400, f'Could not find a document with the document guid: {document_guid}'), 400
        else:
            return send_file(
                filename_or_fp=document_manager_doc.full_storage_path,
                attachment_filename=document_manager_doc.file_display_name,
                as_attachment=True)
