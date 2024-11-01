from io import StringIO

from flask import stream_with_context, Response, request, current_app
import csv
from sqlalchemy.inspection import inspect
from flask_restx import Resource
from werkzeug.exceptions import BadRequest
from ..models.now_application_gis_export import NowApplicationGisExport
from app.api.now_applications.models.application_type_code import ApplicationTypeCode
from app.extensions import api
from app.api.utils.access_decorators import VIEW_ALL, GIS, requires_any_of

class NowApplicationGisExportResource(Resource):

    @api.doc(
        description=
        'This endpoint returns a CSV export of Notice of Work details intended for uses by the GIS team.',
        params={'application_type_code': 'NOW to filter for Notice of Work or ADA for Administrative Amendments'}
    )
    @requires_any_of([VIEW_ALL, GIS])
    def get(self):
        application_type_code = request.args.get("application_type_code", None)
        
        if application_type_code:
            application_type = ApplicationTypeCode.find_by_application_type_code(application_type_code)
            
            if application_type is None:
                raise BadRequest("Invalid application type code")

        model = inspect(NowApplicationGisExport)
        headers = [c.name or "" for c in model.columns]

        def generate():
            data = StringIO()
            writer = csv.writer(data)
            writer.writerow(headers)
            yield data.getvalue()
            data.seek(0)
            data.truncate(0)

            query = NowApplicationGisExport.query_by_application_type(application_type_code)

            for r in query.yield_per(50):
                writer.writerow(r.csv_row())
                yield data.getvalue()
                data.seek(0)
                data.truncate(0)

        return Response(stream_with_context(generate()), mimetype='text/csv')