from flask_restplus import Resource, reqparse, fields
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from ..models.application import Application
from ...mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create


class ApplicationResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('application_no', type=str, help='Number of the application being added.')
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument(
        'application_status_code',
        type=str,
        help='Status of the application being added.',
        store_missing=False)
    parser.add_argument(
        'received_date', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
    parser.add_argument(
        'description', type=str, help='Application description', store_missing=False)

    application_model = api.model(
        'Application', {
            'application_no': fields.String,
            'application_status_code': fields.String,
            'description': fields.String,
            'received_date': fields.DateTime,
        })

    @api.marshal_with(application_model, envelope='applications', code=200)
    @api.doc(
        description=
        'This endpoint returns a list of applications and can be accessed with either and application guid or a mine guid.',
        params={
            'application_guid': 'Application guid to find a specific application.',
            '?mine_guid': 'A mine guid to find all applications associated with.'
        })
    @requires_role_mine_view
    def get(self, application_guid=None):

        mine_guid = request.args.get('mine_guid', None, type=str)
        if application_guid:
            application = Application.find_by_application_guid(application_guid)
            if not application:
                raise NotFound('Application not found')
            else:
                result = application
        elif mine_guid:
            result = Application.find_by_mine_guid(mine_guid)
        else:
            raise BadRequest('An application guid or a mine guid must be provided.')
        return result

    @requires_role_mine_create
    def post(self, application_guid=None):

        if application_guid:
            return self.create_error_payload(400, 'unexpected application_guid'), 400

        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(data.get('mine_guid'))

        if not mine:
            return self.create_error_payload(
                404, 'There was no mine found with the provided mine_guid.'), 404

        application_no, application_status_code, received_date = list(
            map(data.get, ['application_no', 'application_status_code', 'received_date']))

        if not application_no or not application_status_code or not received_date:
            return self.create_error_payload(
                404,
                'An application Number, Received Date and Status are required for an application.'
            ), 404

        try:
            application = Application.create(mine.mine_guid, data['application_no'],
                                             data['application_status_code'], data['received_date'],
                                             data.get('description'), self.get_create_update_dict())
            application.save()
        except Exception as e:
            self.raise_error(500, 'Error: {}'.format(e))
        return application.json()

    @api.doc(params={'application_guid': 'Application guid.'})
    @requires_role_mine_create
    def put(self, application_guid=None):
        if not application_guid:
            return self.create_error_payload(400, 'Error: Application guid was not provided.'), 400

        application = Application.find_by_application_guid(application_guid)

        if not application:
            return self.create_error_payload(404,
                                             'There was no application found with that guid.'), 404

        data = self.parser.parse_args()
        if 'application_status_code' in data:
            application.application_status_code = data.get('application_status_code')
        if 'description' in data:
            application.description = data.get('description')

        try:
            application.save()
        except Exception as e:
            self.raise_error(500, 'Error: {}'.format(e))
        return application.json()
