import decimal
import uuid
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource, reqparse
from flask_uploads import UploadSet, configure_uploads, patch_request_class

from ..models.document_manager import DocumentManager

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    
    #20MB file limit
    FILE_MB_LIMIT = 20 * 1024 * 1024
    
    tailings = UploadSet('tailings', TAILINGS)
    configure_uploads(current_app, (tailings))
    patch_request_class(current_app, FILE_MB_LIMIT)

    @jwt.requires_roles(["mds-mine-create"])
    def post(self):
        data = self.parser.parse_args()
        file_to_save =data.get('file')
        file_name = file_to_save.filename
        mine_guid = data.get('mine_guid')

        document_info = DocumentManager( 
            full_storage_path = None,
            upload_date = datetime.now(),
            file_display_name = file_name,
            path_display_name = None
        )
        document_info.save()
        return {
            'document_manager_guid' : document_info.document_manager_guid
        }