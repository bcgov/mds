from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound

from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import MINE_STATUS_CODE_MODEL


class MineStatusXrefListResource(Resource, UserMixin):
    @api.marshal_with(MINE_STATUS_CODE_MODEL, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineStatusXref.get_all()
