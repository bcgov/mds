from datetime import datetime

from flask_restplus import Resource
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_CSV, TIMEOUT_60_MINUTES


class VerifyPermitResource(Resource):
    @api.doc(
        description=
        'Verifies that a permit is valid for a mine based on the type of deemed authorization.'
    )
    #@requires_role_view_all
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
            type_of_deemed_auth = data.get('type_of_deemed_auth')

            permit = Permit.find_by_permit_no(permit_no)

            if not permit:
                result = "Failure"
                response_message = "NoValidMinesForPermit"
            else:
                mine = Mine.find_by_mine_guid(permit.mine_guid)

                if type_of_deemed_auth == "INDUCED":
                    
                else:
                
                result = "Success"
 
        except:
            result = "Failure"
            mine_info = ""
            response_message = "Unhandled Exception"

        return { "a_Result": result, "a_MineInfo": mine_info, "a_ResponseMessage": response_message, "a_Timestamp": datetime.utcnow}
