from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from ..models.application import Application
from ...mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

application_model = api.model(
    'Application', {
        'application_guid': fields.String,
        'application_no': fields.String,
        'application_status_code': fields.String,
        'description': fields.String,
        'received_date': fields.DateTime,
    })


class ApplicationListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'application_no', type=str, required=True, help='Number of the application being added.')
    parser.add_argument(
        'mine_guid',
        type=str,
        required=True,
        help='guid of the mine the application is being added to.')
    parser.add_argument(
        'application_status_code',
        required=True,
        type=str,
        help='Status of the application being added.')
    parser.add_argument(
        'received_date',
        required=True,
        help='The date the application was received.',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument(
        'description', type=str, help='Application description', store_missing=False)

    @api.marshal_with(application_model, envelope='applications', code=200, as_list=True)
    @api.doc(
        description='This endpoint returns a list of all applications for a given mine.',
        params={'?mine_guid': 'A mine guid to find all applications associated with.'})
    @requires_role_mine_view
    def get(self):
        mine_guid = request.args.get('mine_guid', None, type=str)

        if not mine_guid:
            raise BadRequest('A mine guid must be provided.')

        applications = Application.find_by_mine_guid(mine_guid)

        return applications

    @api.expect(parser)
    @api.doc(
        description=
        'This endpoint creates a new application for the mine specified using the form-data passed.',
        responses={
            400: 'Resource not found.',
            404: 'Bad request.',
        },
        params={'mine_guid': 'A mine guid to associate the application to.'})
    @api.marshal_with(application_model, code=201)
    @requires_role_mine_create
    def post(self):

        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(data.get('mine_guid'))

        if not mine:
            raise NotFound('There was no mine found with the provided mine_guid.')

        application_no, application_status_code, received_date = list(
            map(data.get, ['application_no', 'application_status_code', 'received_date']))

        if not application_no or not application_status_code or not received_date:
            raise BadRequest(
                'An application Number, Received Date and Status are required for an application.')

        application = Application.create(mine.mine_guid, data['application_no'],
                                         data['application_status_code'], data['received_date'],
                                         data.get('description'))
        application.save()

        return application, 201


class ApplicationResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'application_status_code',
        type=str,
        help='Status of the application being added.',
        store_missing=False)
    parser.add_argument(
        'description', type=str, help='Application description', store_missing=False)

    @api.marshal_with(application_model, envelope='applications', code=200)
    @api.doc(
        description='This endpoint returns a single application based on its application guid.',
        params={
            'application_guid': 'Application guid to find a specific application.',
        })
    @requires_role_mine_view
    def get(self, application_guid=None):
        if not application_guid:
            raise BadRequest('An application guid or a mine guid must be provided.')

        application = Application.find_by_application_guid(application_guid)

        if not application:
            raise NotFound('Application not found')

        return [application]

    @api.expect(parser)
    @api.doc(
        description=
        'This endpoint updates an application for the mine specified using the form-data passed.',
        responses={
            400: 'Resource not found.',
            404: 'Bad request.',
        },
        params={'application_guid': 'An application guid.'})
    @api.marshal_with(application_model, code=200)
    @requires_role_mine_create
    def put(self, application_guid=None):
        if not application_guid:
            raise BadRequest('An application guid or a mine guid must be provided.')

        application = Application.find_by_application_guid(application_guid)

        if not application:
            raise NotFound('Application not found')

        data = self.parser.parse_args()
        if 'application_status_code' in data:
            application.application_status_code = data.get('application_status_code')
        if 'description' in data:
            application.description = data.get('description')

        try:
            application.save()
        except Exception as e:
            raise InternalServerError('Error: {}'.format(e))
        return application
