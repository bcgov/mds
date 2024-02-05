from datetime import datetime

from flask_restx import Resource, fields
from flask import request, current_app
from app.extensions import api

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.api.utils.access_decorators import requires_role_view_all

VERIFY_MINE_NOW_MODEL = api.model(
    'VerifyMineNOWModel', {
        'a_Result': fields.String,
        'a_NoWInfo': fields.String,
        'a_ResponseMessage': fields.String,
        'a_Timestamp': fields.DateTime
    })


class VerifyMineNOWResource(Resource):
    @api.doc(
        description='Verifies by mine which NoWs are valid.',
        params={
            'a_MineNumber': f'The mine number.',
        })
    @api.marshal_with(VERIFY_MINE_NOW_MODEL, code=200)
    @requires_role_view_all
    def get(self):
        result = ""
        now_info = ""
        response_message = ""

        try:
            mine_no = request.args.get('a_MineNumber')
            mine = Mine.find_by_mine_no(mine_no)

            # Mine must be operating.
            if mine.mine_status or mine.mine_status[
                    0].mine_status_xref.mine_operation_status_code != "OP":

                permits = mine.mine_permit
                for permit in permits:
                    for permit_amendment in permit.permit_amendments:
                        if permit_amendment.now_identity:
                            now_info = now_info + str(
                                permit_amendment.now_identity.now_number) + " - " + str(
                                    permit_amendment.authorization_end_date) + '\r'
                        else:
                            now_info = now_info + " - " + str(
                                permit_amendment.authorization_end_date) + '\r'
                        break

            if now_info != "":
                result = "Success"
            else:
                result = "Failure"
                response_message = "NoValidNowsForMine"

        except Exception as e:
            current_app.logger.error(str(e))
            result = "Failure"
            now_info = ""
            response_message = "Unhandled Exception"

        return {
            "a_Result": result,
            "a_NoWInfo": now_info,
            "a_ResponseMessage": response_message,
            "a_Timestamp": datetime.utcnow()
        }
