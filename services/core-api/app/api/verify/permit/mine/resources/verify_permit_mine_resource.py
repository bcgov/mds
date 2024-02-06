from datetime import datetime

from flask_restx import Resource, fields
from flask import request, current_app
from app.extensions import api

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.api.utils.access_decorators import requires_role_view_all

VERIFY_PERMIT_MINE_MODEL = api.model(
    'VerifyPermitMineModel', {
        'a_Result': fields.String,
        'a_MineInfo': fields.String,
        'a_ResponseMessage': fields.String,
        'a_Timestamp': fields.DateTime
    })


class VerifyPermitMineResource(Resource):
    @api.doc(
        description=
        'Verifies that a permit is valid for a mine based on the type of deemed authorization. NOTE: This exists for integration purposes and does not follow the typical patterns of this API.',
        params={
            'a_PermitNumber': f'The permit number.',
            'a_TypeofDeemedAuth': f'The type of deemed authorization, eg INDUCED.'
        })
    @api.marshal_with(VERIFY_PERMIT_MINE_MODEL, code=200)
    @requires_role_view_all
    def get(self):
        result = ""
        mine_info = ""
        response_message = ""

        try:
            permit_no = request.args.get('a_PermitNumber')
            permit_prefix = permit_no.split("-")[0]
            type_of_deemed_auth = request.args.get('a_TypeofDeemedAuth')

            permits = Permit.find_by_permit_no_all(permit_no)

            for permit in permits:
                for mine in permit._all_mines:
                    
                    # Mine must be operating.
                    if not mine.mine_status or mine.mine_status[
                            0].mine_status_xref.mine_operation_status_code != "OP":
                        break

                    # IP SURVEYS (Induced): Valid MMS mine types: 'CX','ES','EU'
                    # There may be need of a check against mine_tenure_type_code IN ["MIN", "COL"] and mine_disturbance_code IN ["SUR", "UND"]
                    # but this data is inconsistant for now.
                    if type_of_deemed_auth == "INDUCED" and permit_prefix not in ["CX", "MX"]:
                        break

                    # DRILL PROGRAM (Drill): Valid MMS mine types: 'CS','CU','MS','MU','IS','IU'
                    if type_of_deemed_auth != "INDUCED" and permit_prefix not in ["C", "M"]:
                        break

                    mine_info = mine_info + mine.mine_no + ' - ' + mine.mine_name + '\r'

            if mine_info != "":
                result = "Success"
            else:
                result = "Failure"
                response_message = "NoValidMinesForPermit"

        except Exception as e:
            current_app.logger.error(str(e))
            result = "Failure"
            mine_info = ""
            response_message = "Unhandled Exception"

        return {
            "a_Result": result,
            "a_MineInfo": mine_info,
            "a_ResponseMessage": response_message,
            "a_Timestamp": datetime.utcnow()
        }
