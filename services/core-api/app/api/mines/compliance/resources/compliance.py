import requests
from datetime import datetime
from flask_restplus import Resource, fields
from flask import request, current_app
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api, cache
from app.api.constants import NRIS_COMPLIANCE_DATA, TIMEOUT_60_MINUTES
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all

from app.api.services import NRIS_API_service
from app.api.mines.response_models import MINE_COMPLIANCE_RESPONSE_MODEL
from app.api.mines.mine.models.mine import Mine
from app.config import Config


class MineComplianceSummaryResource(Resource, UserMixin):
    @api.marshal_with(MINE_COMPLIANCE_RESPONSE_MODEL, code=200)
    @requires_role_view_all
    def get(self, mine_no):
        mine = Mine.find_by_mine_no_or_guid(mine_no)
        if not mine:
            raise NotFound("No mine record in CORE.")

        result = cache.get(NRIS_COMPLIANCE_DATA(mine.mine_no))
        if result is None and Config.ENVIRONMENT_NAME == 'prod':
            try:
                raw_data = NRIS_API_service._get_NRIS_data_by_mine(
                    request.headers.get('Authorization'), mine.mine_no)
            except requests.exceptions.Timeout:
                current_app.logger.error(f'NRIS_API Connection Timeout <mine_no={mine.mine_no}>')
                raise
            except requests.exceptions.HTTPError as e:
                current_app.logger.error(
                    f'NRIS_API Connection HTTPError <mine_no={mine.mine_no}>, {str(e)}')
                raise

            result = NRIS_API_service._process_NRIS_data(raw_data)
            if len(result['orders']) > 0:
                cache.set(NRIS_COMPLIANCE_DATA(mine.mine_no), result, timeout=TIMEOUT_60_MINUTES)
        return result
