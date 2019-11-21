from flask import Response
from flask_restplus import Resource
from sqlalchemy.inspection import inspect

from ..models.mine_csv_view import MineCSVView

from app.extensions import api
from ....utils.access_decorators import requires_role_view_all


class MineCSVResource(Resource):
    @api.doc(description='Returns a CSV of basic mine info.')
    @api.doc(
        description=
        'Column headers: mine_guid, mine_name, mine_no, mine_region, major_mine_ind, operating_status, operating_status_code, effective_date, tenure, tenure_code, commodity, commodity_code, disturbance, disturbance_code, permit_no, permittee_party_name'
    )
    @requires_role_view_all
    def get(self):

        model = inspect(MineCSVView)

        result = "\"" + '","'.join([c.name or "" for c in model.columns]) + "\"\n"

        rows = MineCSVView.query.distinct(MineCSVView.mine_name, MineCSVView.permit_no).all()
        result += '\n'.join([r.csv_row() for r in rows])

        return Response(result, mimetype='text/csv')
