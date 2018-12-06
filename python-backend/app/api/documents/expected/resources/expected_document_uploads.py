import decimal
import uuid
import requests
import json

from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions

from ..models.document import ExpectedDocument
from ....mines.mine.models.mine_detail import MineDetail

from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class ExpectedDocumentUploadResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()

    @api.expect(parser)
    @api.doc(
        params={
            'expected_document_guid':
            'Required: The guid of the expected document that this upload will be satisfying.'
        })
    @jwt.requires_roles(["mds-mine-create"])
    def post(self, expected_document_guid):

        self.parser.add_argument(
            'file', type=FileStorage, location='files', action='append')

        try:
            data = self.parser.parse_args()

        except exceptions.RequestEntityTooLarge:
            return ({
                'errors': [{
                    'message':
                    f'The maximum file upload size is {current_app.config["MAX_CONTENT_LENGTH"]/1024/1024}MB please ensure all files are this size.',
                }]
            })

        expected_document = ExpectedDocument.find_by_exp_document_guid(
            expected_document_guid)
        mine_detail = MineDetail.find_by_mine_guid(
            str(expected_document.mine_guid))
        document_category = expected_document.required_document.req_document_category.req_document_category

        folder = 'mines/' + str(
            mine_detail.mine_guid) + '/' + str(document_category)
        pretty_folder = 'mines/' + str(
            mine_detail.mine_no) + '/' + str(document_category)

        document_manager_URL = current_app.config[
            'DOCUMENT_MANAGER_URL'] + '/document-manager'

        args = {'folder': folder, 'pretty_folder': pretty_folder}
        files = []
        headers = {
            'Authorization': request.headers.get('Authorization'),
            'content-type': 'multipart/form-data'
        }

        for file in data['file']:
            files.append(('file', (file.filename, file, file.mimetype)))

        document_guid = requests.post(
            document_manager_URL, data=args, headers=headers)
        raise Exception(document_guid.text)