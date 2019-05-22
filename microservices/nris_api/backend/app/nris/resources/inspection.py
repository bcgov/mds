from flask import request

from flask_restplus import Resource, Namespace, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.logger import get_logger
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.inspection import Inspection, INSPECTION_RESPONSE_MODEL


@api.route('/inspection')
class InspectionListResource(Resource):
    @api.doc(params={'mine_guid': 'Core mine_guid to filter'})
    @api.marshal_with(INSPECTION_RESPONSE_MODEL, envelope='records', code=200)
    @requires_role_nris_view
    def get(self):
        filter_fields = ['inspection_status_code', 'business_area', 'mine_no', 'inspector_idir']
        filtered_params = {k: v for (k, v) in request.args.items() if k in filter_fields}
        filtered_query = Inspection.query.filter_by(**filtered_params).all()
        return filtered_query


@api.route('/inspection/<int:external_id>')
class InspectionListResource(Resource):
    @requires_role_nris_view
    def get(self, external_id):
        return Inspection.query.filter_by(external_id=external_id).first()