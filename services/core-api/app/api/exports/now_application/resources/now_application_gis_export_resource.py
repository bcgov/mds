from flask import Response, current_app
from flask_restplus import Resource
from sqlalchemy.inspection import inspect

from ..models.now_application_gis_export import NowApplicationGisExport

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import NOW_APPLICATION_GIS_EXPORT, TIMEOUT_60_MINUTES


class MineSummaryCSVResource(Resource):
    # TODO: Write description
    @api.doc(description='')
    @requires_role_view_all
    def get(self):

        csv_string = cache.get(NOW_APPLICATION_GIS_EXPORT)
        if not csv_string:

            model = inspect(NowApplicationGisExport)

            csv_string = "\"" + '","'.join([c.name or "" for c in model.columns]) + "\"\n"

            rows = NowApplicationGisExport.query.all()

            csv_string += '\n'.join([r.csv_row() for r in rows])
            cache.set(NOW_APPLICATION_GIS_EXPORT, csv_string, timeout=TIMEOUT_60_MINUTES)

        return Response(csv_string, mimetype='text/csv')
