import uuid
from datetime import datetime
from decimal import Decimal
from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from sqlalchemy.inspection import inspect

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_party, requires_any_of, VIEW_ALL, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_detail import ActivityDetailBase
from app.api.now_applications.response_models import NOWApplicationSchema

from marshmallow_sqlalchemy import ModelSchema, ModelConverter
from marshmallow import fields


class NOWApplicationResource(Resource, UserMixin):
    @requires_role_mine_edit
    def get(self, application_guid):
        application = NOWApplication.query.filter_by(now_application_guid=application_guid).first()
        if not application:
            raise NotFound('NOWApplication not found')

        application.imported_to_core = True
        return NOWApplicationSchema().dump(application)

    def put(self, application_guid):
        application = NOWApplication.query.filter_by(now_application_guid=application_guid).first()
        if not application:
            raise NotFound('NOWApplication not found')

        application.deep_update_from_dict(application, request.json.items())

        application.save()
        return NOWApplicationSchema().dump(application)