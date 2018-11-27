import decimal
import uuid
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource, reqparse

from ..models.document_manager import DocumentManager

from app.extensions import jwt, api
from ...utils.resources_mixins import UserMixin, ErrorMixin


class DocumentManagerResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()

    @jwt.requires_roles(["mds-mine-create"])
    def post(self):
        data = self.parser.parse_args()
        file_to_save =data.get('file')
        file_name = file_to_save.filename
        mine_guid = data.get('mine_guid')

        tailings.save(file_to_save)

        # document_info = DocumentManager( 
        #     full_storage_path = None,
        #     upload_date = datetime.now(),
        #     file_display_name = file_name,
        #     path_display_name = None
        # )
        # document_info.save()

        return {
            'success':'yes',
            #'document_manager_guid' : document_info.document_manager_guid
        }