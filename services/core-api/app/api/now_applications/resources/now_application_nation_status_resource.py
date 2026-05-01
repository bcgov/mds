from flask_restx import Resource
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_nation_status import NOWApplicationNationStatus

from app.api.now_applications.response_models import NOW_APPLICATION_NATION_EVENT_CODE
from werkzeug.exceptions import ServiceUnavailable
from app.api.utils.feature_flag import Feature, is_feature_enabled


class NOWApplicationNationStatusResource(Resource, UserMixin):
    @api.doc(
        description='Get the list of active NoW application nation status')
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(NOW_APPLICATION_NATION_EVENT_CODE, code=200, envelope='records', as_list=True)
    def get(self):
        if not is_feature_enabled(Feature.NOTICE_OF_WORK_NATIONS):
            raise ServiceUnavailable()
        
        return NOWApplicationNationStatus.get_all()