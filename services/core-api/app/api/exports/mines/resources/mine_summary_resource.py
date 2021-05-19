import json
from flask import make_response, request
from flask_restplus import Resource, marshal
from ..models.mine_summary_view import MineSummaryView

from app.api.exports.response_models import MINE_SUMMARY_MODEL
from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_JSON, TIMEOUT_60_MINUTES


class MineSummaryResource(Resource):
    @api.doc(description='Returns a subset of mine data.')
    @requires_role_view_all
    def get(self):
        json_string = cache.get(MINE_DETAILS_JSON)
        if not json_string:
            records = MineSummaryView.query.all()
            content_dict = marshal(records, MINE_SUMMARY_MODEL)
            json_string = json.dumps({'mines': content_dict}, separators=(',', ':'))
            cache.set(MINE_DETAILS_JSON, json_string, timeout=TIMEOUT_60_MINUTES)

        response = make_response(json_string)
        response.headers['content-type'] = 'application/json'
        response.make_conditional(request)

        return response
