from flask import request, Response
from flask_restplus import Resource, reqparse

from ..models.mine import Mine
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
# from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineCSVResource(Resource):
    parser = reqparse.RequestParser()

    @api.doc(description='Returns a CSV of basic mine info.')
    @requires_role_view_all
    def get(self):
        csv = Mine.to_csv(['mine_guid', 'mine_name', 'major_mine_ind', 'mine_region'])
        return Response(csv, mimetype='text/csv')