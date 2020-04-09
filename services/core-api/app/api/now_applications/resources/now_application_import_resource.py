import uuid
from datetime import datetime
from decimal import Decimal

from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity

from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_summary.exploration_access import ExplorationAccess
from app.api.now_applications.models.activity_summary.exploration_surface_drilling import ExplorationSurfaceDrilling
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.exploration_surface_drilling_detail import ExplorationSurfaceDrillingDetail

from app.api.now_applications.transmogrify_now import transmogrify_now


class NOWApplicationImportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.', required=True)
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the Notice of Work.',
        location='json')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the Notice of Work.',
        location='json')

    @requires_role_edit_permit
    @api.expect(parser)
    def post(self, application_guid):
        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        now_application_identity = NOWApplicationIdentity.query.filter_by(
            now_application_guid=application_guid).first()
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        application = transmogrify_now(now_application_identity)
        application.mine_guid = mine_guid
        application.latitude = latitude
        application.longitude = longitude
        application.now_application_guid = application_guid

        # This is a first pass but by no means exhaustive solution to preventing the now application from being saved more than once.
        # In the event of multiple requests being fired simultaneously this can still sometimes fail.
        db.session.refresh(now_application_identity)
        if now_application_identity.now_application_id is not None:
            raise BadRequest('This record has already been imported.')
        application.save()

        return {'now_application_guid': str(application.now_application_guid)}
