import uuid
from datetime import datetime

from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, requires_role_mine_edit
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
    def get(self, application_guid):
        original = request.args.get('original', False, type=bool)

        now_application_identity = NOWApplicationIdentity.query.filter_by(
            now_application_guid=application_guid).first()
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id and not original:
            application = NOWApplication.find_by_application_id(
                now_application_identity.now_application_id)
            application.imported_to_core = True
        else:
            application = transmogrify_now(now_application_identity)
            application.imported_to_core = False

        return application