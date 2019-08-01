from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ...region.models.region import MineRegion

from ....constants import MINE_REGION_OPTIONS

MINE_REGION_OPTION = api.model('MineRegion', {
    'mine_region_code': fields.String,
    'description': fields.String
})


class MineRegionResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_region_guid': 'Mine region guid.'})
    @api.marshal_with(MINE_REGION_OPTION, code=201, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineRegion.get_active()
