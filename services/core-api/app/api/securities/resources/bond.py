from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

class BondListResource(Resource, UserMixin):

    @api.doc(params={'mine_guid': 'mine_guid to filter on'})
    @requires_role_view_all
    @api.marshal_with(None, envelope='records', code=200)
    def get(self, mine_guid):
