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


class NoticeOfWorkDocGen(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'now_application_guid',
        type=str,
        location='json',
        required=True,
    )
    parser.add_argument(
        'template_data',
        type=str,
        location='json',
        required=True,
    )

    @api.doc(
        description='Generates the specified document for the NoW with the provided template data.',
        params={'document_type_code': 'Document Type Code.'})
    @requires_role_edit_permit
    def post(self, document_type_code):
        data = self.parser.parse_args()
        print("********************* NoticeOfWorkDocGen *********************", file=sys.stderr)
        print(data, file=sys.stderr)

        # urlz = url_for('static', filename='meow.txt')
        # print(urlz, file=sys.stderr)

        # file_name = '/static/meow.txt'
        # f = open(file_name, "rb")
        # output = f.read()
        # self.set_header('Content-Disposition', 'attachment; filename=output.csv')
        # self.set_header('Content-type', 'text/csv')
        # self.write(output)

        # def generate():
        #     # create and return your data in small parts here
        #     for i in range(10000):
        #         yield str(i)

        # return Response(stream_with_context(generate()))
        # r = requests.get(urlz, stream=True)
        # x = send_from_directory(
        #     current_app.static_folder,
        #     filename="meow.txt",
        #     as_attachment=True,
        #     mimetype="text/event-stream")

        # filename = safe_join(current_app.static_folder, "meow.txt")
        # with open(filename, 'rb') as fd:
        #     content = fd.read()

        #     return Response(content.data.iter_content(chunk_size=10 * 1024))
        # return send_from_directory(current_app.static_folder, "meow.txt", conditional=True)
        # return current_app.send_static_file("meow.txt")
        # return send_file(
        #     "static/meow.txt",
        #     mimetype="application/zip",
        #     as_attachment=True,
        #     attachment_filename="meow.txt")
        # return send_from_directory(
        #     current_app.static_folder, filename="meow.txt", as_attachment=True)
        return flask.redirect(flask.url_for('static', filename='meow.txt'), code=301)
