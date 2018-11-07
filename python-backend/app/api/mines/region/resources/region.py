from flask_restplus import Resource
from ..models.region import MineRegion
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import MINE_REGION_OPTIONS

class MineRegionResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_region_guid': 'Mine region guid.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_region_guid=None):
        if mine_region_guid:
            mine_region = MineRegion.find_by_mine_region_guid(mine_region_guid)
            return mine_region.json() if mine_region else self.create_error_payload(404, 'Mine region not found'), 404
        else:
            return {'options': MINE_REGION_OPTIONS}
