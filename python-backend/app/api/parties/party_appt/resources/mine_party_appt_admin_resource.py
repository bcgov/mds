from flask import request, Response
from flask_restplus import Resource

from app.extensions import api
from ..models.mine_party_appt import MinePartyAppointment
from ...custom_reqparser import CustomReqparser
from ....utils.access_decorators import requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MinePartyApptAdminResource(Resource, UserMixin, ErrorMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_no', type=str, help='number of the mine.')

    @api.doc(params={})
    @requires_role_mine_admin
    def get(self):
        mine_no = request.args.get('mine_no')
        if not mine_no:
            self.raise_error(422, 'No mine number provided')
        history, status, message = MinePartyAppointment.find_manager_history_by_mine_no(mine_no)
        if not history:
            self.raise_error(status, message)
        csv = MinePartyAppointment.to_csv(history, ['processed_by', 'processed_on'])
        return Response(csv, mimetype='text/csv')
