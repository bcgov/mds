import decimal
import uuid
import os
import re
from datetime import datetime
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from flask import request, current_app
from flask_restplus import Resource, reqparse
from flask_uploads import UploadNotAllowed

from ..models.document_manager import DocumentManager
from app.extensions import jwt, api, documents
from ...utils.resources_mixins import UserMixin, ErrorMixin


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    
    @jwt.requires_roles(["mds-mine-create"])
    def post(self):

        self.parser.add_argument('file', type=FileStorage, location='files', action='append')
        self.parser.add_argument('folder', type=str, help='The sub folder path to store the document in.')
        self.parser.add_argument('pretty_folder', type=str, help='The sub folder path to store the document in with the guids replaced for more readable names.')

        try:
            data = self.parser.parse_args()

        except exceptions.RequestEntityTooLarge:
            return({
                'errors':[{
                    'message': f'The maximum file upload size is {current_app.config["FILE_BYTE_LIMIT"]/1024/1024}MB please ensure all files are this size.',
                }]
            })

        folder = data['folder']
        pretty_folder = data['pretty_folder']
        document_guid_list = []
        errors = []
        
        for upload in data['file']:
            try:
                file_guid = uuid.uuid4()
                original_file_name, file_extension = os.path.splitext(upload.filename)

                upload_response = documents.save(upload, folder, (str(file_guid) + file_extension))
                real_path = documents.path(upload_response)

                #create the readable path by removing the guids and replacing them with the more readable versions.
                pretty_path = re.sub(r'\b'+folder+r'\b', pretty_folder, real_path)
                pretty_path = re.sub(r'\b'+str(file_guid)+r'\b', original_file_name, pretty_path)

                document_info = DocumentManager( 
                    document_guid = file_guid,
                    full_storage_path = real_path,
                    upload_date = datetime.now(),
                    file_display_name = (original_file_name + file_extension),
                    path_display_name = pretty_path,
                    **self.get_create_update_dict(),
                )

                document_info.save()
                document_guid_list.append(str(file_guid))

            except UploadNotAllowed as e:
                errors.append(
                    {
                        'message': f'The type of the file: {original_file_name + file_extension} is not allowed.',
                    }
                )
                continue

            except Exception as e:
                errors.append(
                    {
                        'message': 'An unexpected error has occured: ' + str(e),
                    }
                )
                continue

        return {
            'document_manager_guids' : document_guid_list,
            'errors': errors,
        }
