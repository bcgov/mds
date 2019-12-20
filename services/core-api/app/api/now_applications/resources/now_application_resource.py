import uuid
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, NotImplemented

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.transmogrify_now import transmogrify_now

from app.api.now_applications.response_models import NOW_APPLICATION_MODEL


class NOWApplicationResource(Resource, UserMixin):
    @api.doc(
        description='Get a notice of work application.',
        params={
            'original': f'Retrieve the original version of the application. Default: false ',
        })
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def get(self, now_application_guid):
        original = request.args.get('original', False, type=bool)

        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id and not original:
            application = now_application_identity.now_application
            application.imported_to_core = True
        else:
            application = transmogrify_now(now_application_identity)
            application.imported_to_core = False

        return application

    @api.doc(
        description=
        'Updates a now application and nested objects, this endpoint is not idempotent, nested objects without primary keys will be treated as new objects.'
    )
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def put(self, now_application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(now_application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id is None:
            raise NotImplemented(
                'This application has not been imported. Please import an application before making changes.'
            )
        data = request.json
        now_application_identity.now_application.deep_update_from_dict(data)

        return now_application_identity.now_application