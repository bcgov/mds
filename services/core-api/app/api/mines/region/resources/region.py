from flask_restx import Resource
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.region.models.region import MineRegionCode
from app.api.mines.response_models import MINE_REGION_OPTION


class MineRegionResource(Resource, UserMixin):
    @api.doc(params={'mine_region_guid': 'Mine region guid.'})
    @api.marshal_with(MINE_REGION_OPTION, code=201, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineRegionCode.get_all()
