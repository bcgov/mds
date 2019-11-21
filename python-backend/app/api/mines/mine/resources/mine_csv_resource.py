from flask import request, Response
from flask_restplus import Resource, reqparse
from sqlalchemy import cast, String
from sqlalchemy.sql.functions import coalesce
from sqlalchemy.inspection import inspect

from ..models.mine_csv_view import MineCSVView
from app.api.mines.permits.permit.models.permit import Permit

from app.extensions import api
from ....utils.access_decorators import requires_role_view_all


class MineCSVResource(Resource):
    @api.doc(description='Returns a CSV of basic mine info.')
    @requires_role_view_all
    def get(self):
        rows = MineCSVView.query.all()
        return Response('\n'.join([r.csv_row() for r in rows]),
                        mimetype='text/csv')