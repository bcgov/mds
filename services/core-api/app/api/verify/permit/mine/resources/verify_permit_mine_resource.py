from datetime import datetime

from flask_restplus import Resource
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_CSV, TIMEOUT_60_MINUTES


class VerifyPermitMineResource(Resource):
    @api.doc(
        description=
        'Verifies that a permit is valid for a mine based on the type of deemed authorization.'
    )
    @requires_role_view_all
    def get(self):
        parser = CustomReqparser()
        parser.add_argument('a_PermitNumber', type=str, required=True)
        parser.add_argument('a_TypeofDeemedAuth', type=str, required=True)
        data = parser.parse_args()

        result = ""
        mine_info = ""
        response_message = ""

        try:
            permit_no = data.get('permit_no')
            permit_prefix = permit_no.split("-")[0]
            type_of_deemed_auth = data.get('type_of_deemed_auth')

            permits = Permit.find_by_permit_no_all(permit_no)

            for permit in permits:
                mine = Mine.find_by_mine_guid(permit.mine_guid)

                # Mine must be operating.
                if mine.mine_status.mine_status_xref.mine_operation_status_code != "OP":
                    break;

                # IP SURVEYS (Induced): Valid MMS mine types: 'CX','ES','EU'
                # There may be need of a check against mine_tenure_type_code IN ["MIN", "COL"] and mine_disturbance_code IN ["SUR", "UND"]
                # but this data is inconsistant for now. 
                if type_of_deemed_auth == "INDUCED" and permit_prefix not in ["CX", "M"]:
                    break;
                
                # DRILL PROGRAM (Drill): Valid MMS mine types: 'CS','CU','MS','MU','IS','IU'
                if type_of_deemed_auth != "INDUCED" and permit_prefix not in ["C", "M"]:
                    break;
            
                mine_info = mine_info + mine.mine_no + ' - ' + mine.mine_name + "\r\c"

                if mine_info != "":
                    result = "Success"
                else:
                    result = "Failure"
                    response_message = "NoValidMinesForPermit"
 
        except:
            result = "Failure"
            mine_info = ""
            response_message = "Unhandled Exception"

        return { "a_Result": result, "a_MineInfo": mine_info, "a_ResponseMessage": response_message, "a_Timestamp": datetime.utcnow}
