from flask_restx import Resource, inputs, reqparse
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app

class PermitConditionExtractionResource(Resource, UserMixin):

    # @requires_any_of([])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'permit_amendment_guid',
            type=str,
            location='json',
            required=True,
            help='Permit amendment guid to perform condition extraction'
        )
        parser.add_argument(
            'permit_amendment_document_guid',
            type=str,
            location='json',
            required=True,
            help='Reference to the PDF document to extract conditions from'
        )
        args = parser.parse_args()
        current_app.logger.info(args)

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument()
        # get results of extraction

class PermitConditionExtractionProgressResource(Resource, UserMixin):
    api.doc('Returns the status of the permit extraction task')

    # @requires_any_of([])
    def get(self, task_id):
        if not task_id:
            raise BadRequest('No task id provided')
        # call the poll