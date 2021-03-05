import csv
from io import StringIO
from flask import Response, current_app
from flask_restplus import Resource
from sqlalchemy.inspection import inspect

from ..models.mine_summary_view import MineSummaryView

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_CSV, TIMEOUT_60_MINUTES


class MineSummaryCSVResource(Resource):
    @api.doc(
        description=
        'Returns a subset of mine data in a CSV. Column headers: mine_guid, mine_name, mine_no, mine_region, major_mine_ind, operating_status, operating_status_code, effective_date, tenure, tenure_code, commodity, commodity_code, disturbance, disturbance_code, permit_no, permittee_party_name'
    )
    @requires_role_view_all
    def get(self):
        csv_string = cache.get(MINE_DETAILS_CSV)
        if not csv_string:
            model = inspect(MineSummaryView)
            si = StringIO()
            cw = csv.writer(si)
            cw.writerow([c.name or "" for c in model.columns])
            rows = MineSummaryView.query.all()
            cw.writerows([r.csv_row() for r in rows])
            csv_string = si.getvalue()
            cache.set(MINE_DETAILS_CSV, csv_string, timeout=TIMEOUT_60_MINUTES)
        return Response(csv_string, mimetype='text/csv')
