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

from app.api.now_applications.response_models import NOW_APPLICATION_MODEL


class NOWApplicationResource(Resource, UserMixin):
    @requires_role_mine_edit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=200)
    def get(self, application_guid):
        application = NOWApplication.find_by_application_guid(application_guid)
        if not application:
            raise NotFound('NOWApplication not found')

        application.imported_to_core = True
        return application