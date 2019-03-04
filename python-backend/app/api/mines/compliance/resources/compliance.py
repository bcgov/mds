import requests
from datetime import datetime
from flask_restplus import Resource
from flask import request

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....constants import NRIS_COMPLIANCE_DATA, TIMEOUT_24_HOURS
from app.api.nris_services import NRIS_service
from app.extensions import cache


class MineComplianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_no': 'Mine ID.'})
    @requires_role_mine_view
    def get(self, mine_no=None):

        result = cache.get(NRIS_COMPLIANCE_DATA(mine_no))
        if not request.args.get('cacheOnly') and result is None:
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

            if len(response_data) == 0:
                result = None
            else:
                result = NRIS_service._process_NRIS_data(response_data, mine_no)
        return result
