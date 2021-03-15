import csv
from io import StringIO
from flask import Response, current_app
from flask_restplus import Resource
from sqlalchemy.inspection import inspect

from ..models.now_application_gis_export import NowApplicationGisExport

from app.extensions import api, cache
from app.api.utils.access_decorators import VIEW_ALL, GIS, requires_any_of
from app.api.constants import NOW_APPLICATION_GIS_EXPORT, TIMEOUT_60_MINUTES


class NowApplicationGisExportResource(Resource):
    @api.doc(
        description=
        'This endpoint returns a CSV export of Notice of Work details indended for uses by the GIS team.'
    )
    @requires_any_of([VIEW_ALL, GIS])
    def get(self):
        csv_string = cache.get(NOW_APPLICATION_GIS_EXPORT)
        if not csv_string:
            model = inspect(NowApplicationGisExport)
            si = StringIO()
            cw = csv.writer(si)
            cw.writerow([c.name or "" for c in model.columns])
            rows = NowApplicationGisExport.query.all()
            cw.writerows([r.csv_row() for r in rows])
            csv_string = si.getvalue()
            cache.set(NOW_APPLICATION_GIS_EXPORT, csv_string, timeout=TIMEOUT_60_MINUTES)
        return Response(csv_string, mimetype='text/csv')
