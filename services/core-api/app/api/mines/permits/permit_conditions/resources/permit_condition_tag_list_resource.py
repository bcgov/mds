from flask_restx import Resource, marshal
from flask import request

from app.api.mines.response_models import PERMIT_CONDITION_TAG_MODEL
from app.api.utils.access_decorators import requires_role_view_all
from app.extensions import api
from app.api.mines.permits.permit_conditions.models import PermitConditionTag
from app.api.utils.resources_mixins import UserMixin


class PermitConditionTagListResource(Resource, UserMixin):
    @api.doc(description='Get all permit condition tags')
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_TAG_MODEL, code=200, envelope='tags')
    def get(self):
        return PermitConditionTag.get_all()