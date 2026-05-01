from flask.globals import current_app
from flask_restx import Resource, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_role_manage_consultation_advisors
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.now_applications.models.now_application_nation import NOWApplicationNation
from app.api.now_applications.models.now_application_nation_event import NOWApplicationNationEvent
from app.api.now_applications.models.now_application_nation_event_code import NOWApplicationNationEventCode
from werkzeug.exceptions import NotFound, BadRequest, InternalServerError, ServiceUnavailable
from app.api.utils.feature_flag import Feature, is_feature_enabled

from app.api.now_applications.response_models import NOW_APPLICATION_NATION_EVENT


class NOWApplicationNationEventResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_nation_event_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'event_from',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'event_to',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'start_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'end_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )

    @api.doc(
        description='Create a new nation event.',
        params={'now_application_nation_guid': 'The NoW application nation guid.'})
    @api.expect(parser)
    @requires_role_manage_consultation_advisors
    @api.marshal_with(NOW_APPLICATION_NATION_EVENT, code=201)
    def post(self, now_application_guid, now_application_nation_guid):
        if not is_feature_enabled(Feature.NOTICE_OF_WORK_NATIONS):
            raise ServiceUnavailable()
        
        now_application_nation = NOWApplicationNation.find_by_now_application_nation_guid(now_application_nation_guid)
        if now_application_nation is None:
            raise NotFound('NoW application nation not found.')
        
        data = self.parser.parse_args()
        event_code = NOWApplicationNationEventCode.find_by_now_application_nation_event_code(data.get('now_application_nation_event_code'))
        if event_code is None:
            raise BadRequest('Provided nation event code does not exist.')
        try:            
            now_application_nation_event = NOWApplicationNationEvent.create(now_application_nation_guid,
                                                                 data.get('now_application_nation_event_code'),
                                                                 data.get('event_from'),
                                                                 data.get('event_to'),
                                                                 data.get('start_date'),
                                                                 data.get('end_date', None),
                                                                 )
            now_application_nation_event.save()
        except Exception as e:
            current_app.logger.error(e)
            raise InternalServerError(f'Error when saving: {e}')
        else:
            return now_application_nation_event, 201
