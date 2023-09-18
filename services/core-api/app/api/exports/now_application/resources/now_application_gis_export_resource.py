import time
from io import StringIO

from flask import stream_with_context, Response, current_app
import csv
from sqlalchemy.inspection import inspect
from flask_restplus import Resource
from ..models.now_application_gis_export import NowApplicationGisExport
from app.extensions import api, cache
from app.api.utils.access_decorators import VIEW_ALL, GIS, requires_any_of
from app.api.constants import NOW_APPLICATION_GIS_EXPORT, TIMEOUT_60_MINUTES

class NowApplicationGisExportResource(Resource):
    @api.doc(
        description=
        'This endpoint returns a CSV export of Notice of Work details intended for uses by the GIS team.'
    )
    @requires_any_of([VIEW_ALL, GIS])
    def get(self):
        model = inspect(NowApplicationGisExport)
        headers = [c.name or "" for c in model.columns]

        def generate():
            data = StringIO()
            writer = csv.writer(data)
            writer.writerow(headers)
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

            for r in NowApplicationGisExport.query.yield_per(50):
                writer.writerow(r.csv_row())
                yield data.getvalue()
                data.seek(0)
                data.truncate(0)

        return Response(stream_with_context(generate()), mimetype='text/csv')