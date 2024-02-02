from flask import request
from flask_restx import Resource

from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.inspected_location import InspectedLocation as Model, INSPECTED_LOCATION_RESPONSE_MODEL as RESPONSE_MODEL

module_path = 'inspections/<int:inspection_id>/inspected_locations'
filter_fields = ['inspected_location_type']


#@api.route(f'/{module_path}')
class InspectedLocationListResource(Resource):
    @api.doc(params={field: "Filter by exact match" for field in filter_fields})
    @api.marshal_with(RESPONSE_MODEL, envelope='records', code=200)
    @requires_role_nris_view
    def get(self, inspection_id):
        filtered_params = {k: v.strip() for (k, v) in request.args.items() if k in filter_fields}
        filtered_results = Model.query.filter_by(
            inspection_id=inspection_id, **filtered_params).all()
        return filtered_results


#not sure what we are doing with this endpoint yet.
#@api.route(f'/{module_path}/<int:id>')
class InspectedLocationResource(Resource):
    @api.marshal_with(RESPONSE_MODEL, code=200)
    @requires_role_nris_view
    def get(self, inspection_id, id):
        result = Model.query.filter_by(inspection_id=inspection_id, external_id=id).first()
        if not result:
            raise NotFound(f"{Model.__name__} not found")
        return result
