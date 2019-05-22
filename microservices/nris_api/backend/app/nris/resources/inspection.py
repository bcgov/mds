from flask import request

from flask_restplus import Resource, Namespace, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.logger import get_logger
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.inspection import Inspection


@api.route('/inspection')
class InspectionResource(Resource):
    @api.doc(params={'mine_guid': 'Core mine_guid to filter'})
    @requires_role_nris_view
    def get(self):
        #not sure how to format dates to make this works.
        allowable_fields = ['inspection_status_code', 'business_area', 'mine_no', 'inspector_idir']
        filtered_params = {key: value for (key, value) in request.args if key in allowable_fields}
        filtered_query = Inspection.query.filter_by(**filtered_params).all()

        return len(filtered_query)