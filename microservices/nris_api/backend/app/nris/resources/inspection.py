import requests

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
    #@requires_role_nris_view
    def get(self):
        inspections = Inspection.query.all()

        return len(inspections)