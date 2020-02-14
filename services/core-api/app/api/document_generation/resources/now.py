from flask import current_app, send_from_directory, send_file, safe_join, stream_with_context, url_for, Response
from flask_restplus import Resource, fields
from werkzeug.exceptions import BadRequest, NotFound
import requests
import flask
from app.extensions import api, db
from app.api.utils.include.user_info import User
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.custom_reqparser import CustomReqparser
import sys
import os

APP_ROOT = os.path.dirname(os.path.abspath(__file__)) # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')


class NoticeOfWorkDocGen(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'now_application_guid',
        type=str,
        location='json',
                                                 # required=False,
    )
    parser.add_argument(
        'template_data',
        type=str,
        location='json',
                                                 # required=False,
    )

    @api.doc(
        description='Generates the specified document for the NoW with the provided template data.',
        params={'document_type_code': 'Document Type Code.'})
    @requires_role_edit_permit
    def post(self, document_type_code):
        data = self.parser.parse_args()
        print("********************* NoticeOfWorkDocGen *********************", file=sys.stderr)
        print(data, file=sys.stderr)

        return current_app.send_static_file("meow.txt")
        # fileName = "meow.txt"

        # def readFile(filename):
        #     # with open(os.path.join(APP_STATIC, filename)) as f:
        #     with current_app.open_resource('static/meow.txt') as f:
        #         yield f.readline()

        # file_download_req = requests.get(readFile("meow.txt"), stream=True)

        # print(file_download_req, file=sys.stderr)

        # file_download_resp = Response(stream_with_context(readFile(fileName)))
        # # stream_with_context(file_download_req.iter_content(chunk_size=2048)))

        # # file_download_resp.headers['Content-Type'] = "application/octet-stream"
        # # file_download_resp.headers['Content-Disposition'] = f'attachment; filename="{fileName}"'
        # return file_download_resp