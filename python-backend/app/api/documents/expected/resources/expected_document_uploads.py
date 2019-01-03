import decimal
import uuid
import requests
import json

from datetime import datetime
from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.datastructures import FileStorage
from werkzeug import exceptions
from sqlalchemy.exc import DBAPIError

from ..models.mine_expected_document import MineExpectedDocument
from ....mines.mine.models.mine_detail import MineDetail
from ...expected.models.mine_expected_document import MineExpectedDocument
from ...expected.models.mine_expected_document_xref import MineExpectedDocumentXref
from ...mines.models.mine_document import MineDocument

from app.extensions import jwt, api, db
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
            'file',
            type=FileStorage,
            location='files',
            action='append',
            required=True)

        try:
            data = self.parser.parse_args()

        except exceptions.RequestEntityTooLarge:
            return self.create_error_payload(
                413,
                f'The maximum file upload size is {current_app.config["MAX_CONTENT_LENGTH"]/1024/1024}MB please ensure all files are this size.'
            )

        expected_document = MineExpectedDocument.find_by_exp_document_guid(
            expected_document_guid)
        mine_detail = MineDetail.find_by_mine_guid(
            str(expected_document.mine_guid))
        document_category = expected_document.required_document.req_document_category.req_document_category

        if document_category:
            folder = 'mines/' + str(
                mine_detail.mine_guid) + '/' + str(document_category)
            pretty_folder = 'mines/' + str(
                mine_detail.mine_no) + '/' + str(document_category)
        else:
            folder = 'mines/' + str(mine_detail.mine_guid) + '/documents'
            pretty_folder = 'mines/' + str(mine_detail.mine_no) + '/documents'

        document_manager_URL = current_app.config[
            'DOCUMENT_MANAGER_URL'] + '/document-manager'

        files = []

        for file in data['file']:
            files.append(('file', (file.filename, file, file.mimetype)))

        args = {'folder': folder, 'pretty_folder': pretty_folder}
        headers = {'Authorization': request.headers.get('Authorization')}

        response = requests.post(
            url=document_manager_URL, data=args, files=files, headers=headers, timeout=None)
        json_response = response.json()

        errors = json_response['errors']
        document_guids = json_response['document_manager_guids']
        filenames = []

        try:
            for key, value in document_guids.items():
                doc = MineDocument(
                    mine_guid=expected_document.mine_guid,
                    document_manager_guid=key,
                    document_name=value,
                    **self.get_create_update_dict())

                expected_document.mine_documents.append(doc)
                db.session.add(expected_document)
                filenames.append(value)

            db.session.commit()

        except DBAPIError:
            #log the error here and return a pretty error message
            db.session.rollback()
            return self.create_error_payload(500,
                                             'An unexpected error occured')

        return {'status': 200, 'errors': errors, 'files': filenames}
