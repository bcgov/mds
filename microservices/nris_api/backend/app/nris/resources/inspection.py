from flask import request
from flask_restplus import Resource

from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.inspection import Inspection, INSPECTION_RESPONSE_MODEL


@api.route('/inspections')
class InspectionListResource(Resource):
    filter_fields = ['inspection_status_code', 'business_area', 'mine_no', 'inspector_idir']

    @api.doc(params={field: "Filter by exact match" for field in filter_fields})
    @api.marshal_with(INSPECTION_RESPONSE_MODEL, envelope='records', code=200)
    @requires_role_nris_view
    def get(self):
        filtered_params = {k: v for (k, v) in request.args.items() if k in filter_fields}
        filtered_results = Inspection.query.filter_by(**filtered_params).all()
        return filtered_results


@api.route('/inspections/<int:external_id>')
class InspectionListResource(Resource):
    @api.marshal_with(INSPECTION_RESPONSE_MODEL, code=200)
    @requires_role_nris_view
    def get(self, external_id):
        inspection = Inspection.query.filter_by(external_id=external_id).first()
        if not inspection:
            raise NotFound("Inspection not found")
        return inspection