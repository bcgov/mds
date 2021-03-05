import csv
from io import StringIO
from flask import Response, current_app
from flask_restplus import Resource
from sqlalchemy.inspection import inspect

from ..models.now_application_gis_file_export import NowApplicationGisFileExport

from app.extensions import api, cache
from app.api.utils.access_decorators import VIEW_ALL, GIS, requires_any_of
from app.api.constants import TIMEOUT_60_MINUTES


class NowApplicationGisExportResource(Resource):
    # TODO: Write description
    @api.doc(description='')
    @requires_any_of([VIEW_ALL, GIS])
    def get(self):
        model = inspect(NowApplicationGisFileExport)
        si = StringIO()
        cw = csv.writer(si)
        cw.writerow([c.name or "" for c in model.columns])
        rows = NowApplicationGisFileExport.query.all()
        cw.writerows([r.csv_row() for r in rows])
        csv_string = si.getvalue()
        return Response(csv_string, mimetype='text/csv')
