from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from ..models.application import Application
from ...mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit

application_model = api.model(
    'Application', {
        'application_guid': fields.String,
        'application_no': fields.String,
        'application_status_code': fields.String,
        'description': fields.String,
        'received_date': fields.Date,
    })


class ApplicationListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_no',
                        type=str,
                        required=True,
                        help='Number of the application being added.',
                        location='json')
    parser.add_argument('application_status_code',
                        required=True,
                        type=str,
                        help='Status of the application being added.',
                        location='json')
    parser.add_argument('received_date',
                        required=True,
                        help='The date the application was received.',
                        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
                        location='json')
    parser.add_argument('description',
                        type=str,
                        help='Application description',
                        store_missing=False,
                        location='json')

    @api.marshal_with(application_model, envelope='applications', code=200, as_list=True)
    @api.doc(description='This endpoint returns a list of all applications for a given mine.',
             params={'?mine_guid': 'A mine guid to find all applications associated with.'})
    @requires_role_view_all
    def get(self, mine_guid):
        applications = Application.find_by_mine_guid(mine_guid)
        return applications

    @api.expect(parser)
    @api.doc(
        description=
        'This endpoint creates a new application for the mine specified using the form-data passed.'
    )
    @api.marshal_with(application_model, code=201)
    @requires_role_mine_edit
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

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
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('application_status_code',
                        type=str,
                        help='Status of the application being added.',
                        store_missing=False,
                        location='json')
    parser.add_argument('description',
                        type=str,
                        help='Application description',
                        store_missing=False,
                        location='json')

    @api.marshal_with(application_model, envelope='applications', code=200)
    @api.doc(description='This endpoint returns a single application based on its application guid.'
             )
    @requires_role_view_all
    def get(self, mine_guid, application_guid):
        application = Application.find_by_application_guid(application_guid)
        if not application or application.mine_guid != mine_guid:
            raise NotFound('Application not found.')
        return application

    @api.expect(parser)
    @api.doc(
        description=
        'This endpoint updates an application for the mine specified using the form-data passed.', )
    @api.marshal_with(application_model, code=200)
    @requires_role_mine_edit
    def put(self, mine_guid, application_guid):
        application = Application.find_by_application_guid(application_guid)
        if not application or application.mine_guid != mine_guid:
            raise NotFound('Application not found.')

        data = self.parser.parse_args()
        for key, value in data.items():
            setattr(application, key, value)

        application.save()
        return application
