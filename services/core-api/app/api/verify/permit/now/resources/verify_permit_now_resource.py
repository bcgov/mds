from datetime import datetime

from flask_restplus import Resource
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_CSV, TIMEOUT_60_MINUTES


class VerifyPermitNOWResource(Resource):
    @api.doc(
        description=
        'Verifies by permit number that a permit amendment is within 30 days of authorization ending.'
    )
    @requires_role_view_all
    def get(self):
        parser = CustomReqparser()
        parser.add_argument('a_PermitNumber', type=str, required=True)
        data = parser.parse_args()

        result = ""
        now_info = ""
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

                if permit_prefix not in ["CX", "M"]:
                    break;
            
                for permit_amendment in permit.permit_amendments:
                    if datetime.now() - permit_amendment.authorization_end_date < 30:
                        now_info = now_info + permit.permit_guid + " - " + permit_amendment.authorization_end_date "\r\c"

                if now_info != "":
                    result = "Success"
                else
                    result = "Failure"
                    response_message = "NoValidNowsForPermit"
 
        except:
            result = "Failure"
            now_info = ""
            response_message = "Unhandled Exception"

        return { "a_Result": result, "a_NoWInfo": now_info, "a_ResponseMessage": response_message, "a_Timestamp": datetime.utcnow}
