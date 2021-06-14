import json

from flask_restplus import Resource, marshal
from ..models.mine_summary_view import MineSummaryView

from app.api.exports.response_models import MINE_SUMMARY_MODEL
from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_JSON, TIMEOUT_60_MINUTES


class MineSummaryResource(Resource):
    @api.doc(description='Returns a subset of mine data.')
    @api.marshal_with(MINE_SUMMARY_MODEL, envelope='mines', code=200, as_list=True)
    @requires_role_view_all
    def get(self):
        json_string = cache.get(MINE_DETAILS_JSON)
        if not json_string:
            records = MineSummaryView.query.all()
            content_dict = marshal(records, MINE_SUMMARY_MODEL)
            json_string = json.dumps(content_dict, separators=(',', ':'))
            cache.set(MINE_DETAILS_JSON, json_string, timeout=TIMEOUT_60_MINUTES)

        return json.loads(json_string)
