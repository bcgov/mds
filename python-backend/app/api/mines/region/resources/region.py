from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_REGION_OPTIONS

class MineRegionResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_region_guid': 'Mine region guid.'})
    @requires_role_view_all
    def get(self, mine_region_guid=None):
        return {'records': MINE_REGION_OPTIONS}
