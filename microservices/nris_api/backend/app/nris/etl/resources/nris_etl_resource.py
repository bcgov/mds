from flask_restplus import Resource, Namespace, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.utils.logger import get_logger
from app.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.etl.nris_etl import convert_xml_to_json


class NRISETLResource(Resource):
    def get(self):
        nris_data = db.session.query(NRISRawData).all()
        data = convert_xml_to_json(nris_data[0].nris_data)

        return data
