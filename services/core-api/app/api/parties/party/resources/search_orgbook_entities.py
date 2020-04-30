from flask import request, current_app
from flask_restplus import Resource
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService


class SearchOrgBookEntities(Resource):
    @api.doc(description='', params={})
    # @requires_role_view_all
    # @api.marshal_with(None, code=200)
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search_autocomplete(search)
        return resp
