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
from app.extensions import jwt, api, tailings
from ...utils.resources_mixins import UserMixin, ErrorMixin


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    
    @jwt.requires_roles(["mds-mine-create"])
    def post(self):

        self.parser.add_argument('file', type=FileStorage, location='files', action='append')
        self.parser.add_argument('mine_guid', type=str, help='mine to the new document on')
        self.parser.add_argument('mine_no', type=str, help='mine to the new document on')
        try:
            data = self.parser.parse_args()
            mine_guid = data['mine_guid']
            mine_no = data['mine_no']
            document_guid_list = []
            errors = []
        except exceptions.RequestEntityTooLarge:
            return({
                'errors':[{'message': 'The maximum file upload size is 20MB please ensure all files are this size.'}]
            })

        for upload in data['file']:
            try:
                file_guid = uuid.uuid4()
                original_file_name, file_extension = os.path.splitext(upload.filename)

                upload_response = tailings.save(upload, mine_guid, (str(file_guid) + file_extension))
                real_path = tailings.path(upload_response)

                #create the readable path by removing the guids and replacing them with the original file name and mine no
                pretty_path = re.sub(r'\b'+mine_guid+r'\b', mine_no, real_path)
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
                        'message': f'The type of the file: {original_file_name + file_extension} is not allowed and must be of the types {current_app.config["TAILINGS_FILE_SET"]}'
                    }
                )
                continue
            except Exception as e:
                errors.append(
                    {
                        'message': 'An unexpected error has occured: ' + str(e)
                    }
                )
                continue


        return {
            'document_manager_guids' : document_guid_list,
            'errors': errors
        }
