from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin

from app.api.now_applications.models.now_application_delay_type import NOWApplicationDelayType
from app.api.now_applications.models.now_application_delay import NOWApplicationDelay
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.response_models import NOW_APPLICATION_DELAY_TYPE


class NOWApplicationDelayTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY_TYPE, code=200, envelope='records')
    def get(self):
        return NOWApplicationDelayType.get_all()


class NOWApplicationDelayListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=dict, location='json', required=True)

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY_TYPE, code=200, envelope='records')
    def get(self, now_application_guid):
        return NOWApplicationIdentity.find_by_id(now_application_guid).application_delays

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY_TYPE, code=200)
    def post(self, now_application_guid):
        return NOWApplicationIdentity.find_by_id(now_application_guid).application_delays


class NOWApplicationDelayResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('now_application_guid', type=str, location='json', required=True)
    parser.add_argument('template_data', type=dict, location='json', required=True)

    @api.doc(description='Get a list of all Notice of Work Delay Reasons.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_DELAY_TYPE, code=200, envelope='records')
    def put(self, now_application_guid):
        return {}
