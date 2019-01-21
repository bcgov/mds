from flask_restplus import Resource

from ..models.mine_location import MineLocation
from ...mine.models.mine import Mine
from ....utils.resources_mixins import ErrorMixin
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view


class MineLocationResource(Resource, ErrorMixin):
    @api.doc(
        params={
            'mine_location_guid':
            'Guid for mine location, if not provided a list of all mine locations will be returned.'
        })
    @requires_role_mine_view
    def get(self, mine_location_guid=None):
        if mine_location_guid:
            mine_location = MineLocation.find_by_mine_location_guid(mine_location_guid)
            if mine_location:
                return mine_location.json()
            return self.create_error_payload(404, 'Mine Location not found'), 404
        else:
            return {'mines': list(map(lambda x: x.json_by_location(), Mine.query.all()))}
