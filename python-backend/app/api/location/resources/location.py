from flask_restplus import Resource

from ..models.location import MineLocation
from ...mine.models.mines import MineIdentity
from ...utils.resources_mixins import ErrorMixin
from app.extensions import jwt


class MineLocationResource(Resource, ErrorMixin):
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_location_guid=None):
        if mine_location_guid:
            mine_location = MineLocation.find_by_mine_location_guid(mine_location_guid)
            if mine_location:
                return mine_location.json()
            return self.create_error_payload(404, 'Mine Location not found'), 404
        else:
            return {'mines': list(map(lambda x: x.json_by_location(), MineIdentity.query.all()))}
