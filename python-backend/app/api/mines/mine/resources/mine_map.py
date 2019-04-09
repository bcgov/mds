import uuid
from datetime import datetime
import json

from flask import request, make_response, current_app
from flask_restplus import Resource, reqparse, inputs, fields

from app.api.mines.location.models.mine_map_view_location import MineMapViewLocation
from app.extensions import api, cache, db
from ....utils.access_decorators import requires_any_of, MINE_VIEW, MINESPACE_PROPONENT
from ....utils.resources_mixins import UserMixin
from ....constants import MINE_MAP_CACHE, TIMEOUT_12_HOURS

# FIXME: Model import from outside of its namespace
# This breaks micro-service architecture and is done
# for search performance until search can be refactored

mine_location = api.model('MineMapLocation', {
    'latitude': fields.String,
    'longitude': fields.String,
})

mine_map_list = api.model(
    'MineMap', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_location': fields.Nested(mine_location)
    })


class MineMapResource(Resource, UserMixin):
    @api.doc(description='This endpoint returns a list of all mines to be displayed on the map.')
    @api.response(
        200,
        'Returns a list of mines with less information to be displayed on the map.',
        model=mine_map_list)
    @requires_any_of([MINE_VIEW, MINESPACE_PROPONENT])
    def get(self):
        # Below caches the mine map response object in redis with a timeout.
        # Generating and jsonifying the map data takes 4-7 seconds with 50,000 points,
        # so caching seems justified.
        #
        # TODO: Use some custom representation of this data vs JSON. The
        # json string is massive (with 50,000 points: 16mb uncompressed, 2.5mb compressed).
        # A quick test using delimented data brings this down to ~1mb compressed.
        map_result = cache.get(MINE_MAP_CACHE)
        last_modified = cache.get(MINE_MAP_CACHE + '_LAST_MODIFIED')
        if not map_result:
            records = MineMapViewLocation.query.filter(MineMapViewLocation.latitude != None).all()
            last_modified = datetime.utcnow()

            # jsonify then store in cache
            current_app.logger.error(str(records))
            map_result = json.dumps({
                'mines': list((map(lambda x: x.json_for_map(), records)))
            },
                                    separators=(',', ':'))

            cache.set(MINE_MAP_CACHE, map_result, timeout=TIMEOUT_12_HOURS)
            cache.set(MINE_MAP_CACHE + '_LAST_MODIFIED', last_modified, timeout=TIMEOUT_12_HOURS)

        # It's more efficient to store the json to avoid re-initializing all of the objects
        # and jsonifying on every request, so a flask response is returned to prevent
        # flask_restplus from jsonifying the data again, which would mangle the json.
        response = make_response(map_result)
        response.headers['content-type'] = 'application/json'

        # While we're at it, let's set a last modified date and have flask return not modified
        # if it hasn't so the client doesn't download it again unless needed.
        response.last_modified = last_modified
        response.make_conditional(request)

        return response