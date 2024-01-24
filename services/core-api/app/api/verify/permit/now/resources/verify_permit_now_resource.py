from datetime import datetime

from flask_restx import Resource, fields
from flask import request, current_app
from app.extensions import api

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.api.utils.access_decorators import requires_role_view_all

VERIFY_PERMIT_NOW_MODEL = api.model(
    'VerifyPermitNOWModel', {
        'a_Result': fields.String,
        'a_NoWInfo': fields.String,
        'a_ResponseMessage': fields.String,
        'a_Timestamp': fields.DateTime
    })


class VerifyPermitNOWResource(Resource):
    @api.doc(
        description=
        'Verifies by permit number that a permit amendment is within 30 days of authorization ending. NOTE: This exists for integration purposes and does not follow the typical patterns of this API.',
        params={
            'a_PermitNumber': f'The permit number.',
        })
    @api.marshal_with(VERIFY_PERMIT_NOW_MODEL, code=200)
    @requires_role_view_all
    def get(self):
        result = ""
        now_info = ""
        response_message = ""

        try:
            permit_no = request.args.get('a_PermitNumber')
            permit_prefix = permit_no.split("-")[0]

            permits = Permit.find_by_permit_no_all(permit_no)

            for permit in permits:
                for mine in permit._all_mines:
                    permit._context_mine = mine

                    # Mine must be operating.
                    if not mine.mine_status or mine.mine_status[
                            0].mine_status_xref.mine_operation_status_code != "OP":
                        break

                    if permit_prefix not in ["CX", "MX"]:
                        break

                    for permit_amendment in permit.permit_amendments:
                        if (permit_amendment.authorization_end_date -
                                datetime.utcnow().date()).days > 30:
                            #only want permits that expire 30 days or further in the future
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
                response_message = "NoValidNowsForPermit"

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
