import requests
from datetime import datetime
from flask_restplus import Resource, fields
from flask import request
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import NRIS_COMPLIANCE_DATA, TIMEOUT_24_HOURS
from app.api.services import NRIS_API_service
from app.extensions import cache

from app.api.mines.mine.models.mine import Mine

class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


ORDER_MODEL = api.model(
    'MineComplianceOrder', {
        "order_no": fields.String,
        "violation": fields.String,
        "report_no": fields.Integer,
        "inspector": fields.String,
        "due_date": fields.Date,
        "order_status": fields.String,
        "overdue": fields.Boolean,
    })

MINE_COMPLIANCE_RESPONSE_MODEL = api.model(
    'MineComplianceData', {
        'last_inspection':
        fields.DateTime,
        'last_inspector':
        fields.String,
        'num_open_orders':
        fields.Integer,
        'num_overdue_orders':
        fields.Integer,
        'all_time':
        fields.Nested({
            'num_inspections': fields.Integer,
            'num_advisories': fields.Integer,
            'num_warnings': fields.Integer,
            'num_requests': fields.Integer,
        }),       
        'last_12_months':
        fields.Nested({
            'num_inspections': fields.Integer,
            'num_advisories': fields.Integer,
            'num_warnings': fields.Integer,
            'num_requests': fields.Integer,
        }),
        'current_fiscal':
        fields.Nested({
            'num_inspections': fields.Integer,
            'num_advisories': fields.Integer,
            'num_warnings': fields.Integer,
            'num_requests': fields.Integer,
        }),
        'orders':
        fields.List(fields.Nested(ORDER_MODEL)),
    })


class MineComplianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_no': 'Mine ID.'})
    @requires_role_mine_view
    def get(self, mine_no=None):

        result = None  #cache.get(NRIS_COMPLIANCE_DATA(mine_no))
        if result is None:
            try:
                response_data = NRIS_service._get_EMPR_data_from_NRIS(mine_no)
            except requests.exceptions.Timeout:
                return self.create_error_payload(408, 'NRIS is down or unresponsive.'), 408
            except requests.exceptions.HTTPError as errhttp:
                return self.create_error_payload(
                    errhttp.response.status_code,
                    'An NRIS error has occurred and no data is available at this time. Please check again later. If the problem persists please contact your NRIS administrator.'
                ), errhttp.response.status_code
            except TypeError as e:
                return self.create_error_payload(500, str(e)), 500

            result = NRIS_service._process_NRIS_data(response_data)
        #    cache.set(NRIS_COMPLIANCE_DATA(mine_no), result, timeout=TIMEOUT_24_HOURS)
        return result



class MineComplianceSummaryResource(Resource, UserMixin, ErrorMixin):
    @api.marshal_with(MINE_COMPLIANCE_RESPONSE_MODEL, code=200)
    @requires_role_mine_view
    def get(self, mine_no):
        result = None

        mine = Mine.find_by_mine_no_or_guid(mine_no)
        if not mine:
            raise NotFound("No mine record in CORE.")     

        try:
            raw_data = NRIS_API_service._get_NRIS_data_by_mine(request.headers.get('Authorization'),
                                                               mine_no)
        except requests.exceptions.Timeout:
            raise
        except requests.exceptions.HTTPError:
            raise

        return NRIS_API_service._process_NRIS_data(raw_data)