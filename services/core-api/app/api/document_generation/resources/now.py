# TODO: Remove unneeded imports and debug statements when file is properly implemented.
from flask import current_app, send_from_directory, send_file, safe_join, stream_with_context, url_for, Response
from flask_restplus import Resource, fields
from werkzeug.exceptions import NotImplemented
import requests
import flask
import sys
from app.extensions import api, db
from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser


class NoticeOfWorkDocumentGeneration(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=str, location='json', required=True)

    @api.doc(
        description='Generates the specified document for the NoW using the provided template data.',
        params={'document_type_code': 'The code indicating the type of document to generate.'})
    @requires_role_edit_permit
    def post(self, document_type_code):
        print("************ NoticeOfWorkDocumentGeneration POST:", file=sys.stderr)
        data = self.parser.parse_args()
        print(data, file=sys.stderr)
        raise NotImplemented('This endpoint is under construction.')
