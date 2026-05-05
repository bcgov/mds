from flask.globals import current_app
from flask_restx import Resource, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, requires_role_manage_consultation_advisors
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_nation import NOWApplicationNation
from app.api.now_applications.models.now_application_nation_status import NOWApplicationNationStatus
from werkzeug.exceptions import NotFound, BadRequest, InternalServerError, ServiceUnavailable
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.now_applications.response_models import NOW_APPLICATION_NATION

class NOWApplicationNationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_nation_status_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'consultation_started_by_client',
        type=inputs.boolean,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'due_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'contact_organization_name',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'organization_guid',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'consultation_area_name',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'consultation_area_guid',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'consultation_area_update_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=True,
    )

    @api.doc(
        description='Get a list of NoW Nations for the given NoW application guid.',
        params={'now_application_guid': 'The guid of the NoW application to get nations for.'})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(NOW_APPLICATION_NATION, code=200, envelope='records', as_list=True)
    def get(self, now_application_guid):
        if not is_feature_enabled(Feature.NOTICE_OF_WORK_NATIONS):
            raise ServiceUnavailable()
        
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if now_application_identity is None:
            raise NotFound('NoW application identity not found.')
        try:
            now_application_nations = NOWApplicationNation.find_by_now_application_guid(now_application_guid)
        except Exception as e:
            current_app.logger.error(e)
            raise InternalServerError('Retrieval of NoW application nations failed due to an internal error.')
        else:
            return now_application_nations
        

    @api.doc(
        description='Create a new nation that will be reviewing the consultation of the NoW application.',
        params={'now_application_guid': 'The guid of the NoW application to create a nation for.'})
    @api.expect(parser)
    @requires_role_manage_consultation_advisors
    @api.marshal_with(NOW_APPLICATION_NATION, code=201)
    def post(self, now_application_guid):
        if not is_feature_enabled(Feature.NOTICE_OF_WORK_NATIONS):
            raise ServiceUnavailable()
        
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if now_application_identity is None:
            raise NotFound('NoW application identity not found.')
        
        data = self.parser.parse_args()
        status = NOWApplicationNationStatus.find_by_now_application_nation_status_code(data.get('now_application_nation_status_code'))
        if status is None:
            raise BadRequest('Provided nation status code does not exist.')
        try:            
            now_application_nation = NOWApplicationNation.create(now_application_guid,
                                                                 data.get('now_application_nation_status_code'),
                                                                 data.get('due_date'),
                                                                 data.get('contact_organization_name'),
                                                                 data.get('organization_guid'),
                                                                 data.get('consultation_area_name'),
                                                                 data.get('consultation_area_guid'),
                                                                 data.get('consultation_area_update_date'),
                                                                 data.get('consultation_started_by_client', False)
                                                                 )
            now_application_nation.save()
        except Exception as e:
            current_app.logger.error(e)
            raise InternalServerError(f'Error when saving: {e}')
        else:
            return now_application_nation, 201

    @api.doc(
        description='Delete a NoW application nation consultation reviewer.',
        params={
            'now_application_guid': 'The guid of the NoW application the nation is associated to.',
            'now_application_nation_guid': 'The guid of the nation.'
        })
    @requires_role_manage_consultation_advisors
    @api.response(204, 'Successfully deleted.')
    def delete(self, now_application_guid, now_application_nation_guid):
        if not is_feature_enabled(Feature.NOTICE_OF_WORK_NATIONS):
            raise ServiceUnavailable()

        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if now_application_identity is None:
            raise NotFound('NoW application identity not found.')
        now_application_nation = NOWApplicationNation.find_by_now_application_nation_guid(now_application_nation_guid)
        if now_application_nation is None:
            raise NotFound('NoW application nation not found.')
        if str(now_application_nation.now_application_guid) != str(now_application_guid):
            raise BadRequest('Nation does not belong to provided NoW application.')
        
        try:
            now_application_nation.delete()
        except Exception as e:
            current_app.logger.error(e)
            raise InternalServerError('NoW application nation deletion failed due to an internal error.')
        
        return None, 204