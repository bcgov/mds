from flask_restplus import Resource, Namespace, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.logger import get_logger
from app.nris.utils.access_decorators import requires_role_nris_view
from app.nris.models.test_model import Factorial


class InspectionResource(Resource):
    parser = reqparser()
    