import requests, json, pprint

from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from flask import request, current_app
from app.config import Config


class OrgBookIssuerControllerService():
    """This class is used to connect to an issuer controller, which handles the nuance and handshakes involved with issuing
    verifiable credentials to a Verifiable Credential Registry (VRC), OrgBook is an instance of aries-vrc (https://github.com/bcgov/aries-vcr).
    Mines-Digital-Trust has stood up an Issuer Controller API (https://github.com/bcgov/aries-vcr-issuer-controller) to serve CORE to issue 
    Mines Act Permits as VC's."""
    issuer_controller_url = Config.VCR_ISSUER_URL    #FROM DeployConfig
    issuer_secret_key = Config.VCR_ISSUER_SECRET_KEY #FROM SECRET
    vc_schema_name = "bcgov-mines-act-permit.bcgov-mines-permitting"
    vc_schema_version = "0.2.0"

    def __init__(self):
        #TODO RUN LIVENESS CHECK
        pass

    def publish_schema(self, new_schema, new_schema_version):
        raise NotImplementedError(
            """The MDT issuer controller publishes schema on init, to update your VC schema,
                send them a message. This can be done dynamically in the future once MDT implements it"""
        )

    def inspect_current_schema(self):
        raise NotImplementedError(
            """Hopefully this exists, the MDT issuer controller should be able to inspect
                and return the current schema it is expecting/allowing. 
            
                Inspecting old schemas can be done by looking at the hyperledger directly
                production -> http://prod.bcovrin.vonx.io/browse/domain?page=1&query=&txn_type=101
                test - http://test.bcovrin.vonx.io/browse/domain?page=1&query=&txn_type=101
                dev  - http://dev.bcovrin.vonx.io/browse/domain?page=1&query=&txn_type=101
                """)

    def issue_permit_amendment_vc(self, permit_amendment):

        permittee_orgbook_entity = permit_amendment.permit.permittee_appointments[
            0].party.party_orgbook_entity
        if not permittee_orgbook_entity:
            current_app.logger.warn(
                'skipping issue_permit_amendment_vc, permittee not link to orgbook business')
            return

        payload = json.dumps([{
            "schema": self.vc_schema_name,
            "version": self.vc_schema_version,
            "attributes": {
                "permit_id": str(permit_amendment.permit_guid),
                "registration_id": permittee_orgbook_entity.registration_id,
                "permit_no": permit_amendment.permit.permit_no,
                "mine_no": permit_amendment.mine.mine_no,
                "mine_class": 'major' if permit_amendment.mine.major_mine_ind else 'regional',
                "latitude": str(permit_amendment.mine.latitude),
                "longitude": str(permit_amendment.mine.longitude),
                "issued_date": str(permit_amendment.issue_date),
                "effective_date": str(permit_amendment.issue_date),
                "authorization_end_date": str(permit_amendment.authorization_end_date),
                "inspector_name": "Best Inspector"
            }
        }])
        current_app.logger.info('sending VC with payload')
        # pprint.pprint(payload)
        current_app.logger.info(self.issuer_controller_url)
        response = requests.post(
            self.issuer_controller_url + 'issue-credential',
            data=payload,
            headers={
                'issuer_secret_key': self.issuer_secret_key,
                'Content-Type': 'application/json'
            })
        current_app.logger.info('request')
        # pprint.pprint(response.request.__dict__)
        current_app.logger.info('vc issuer response')
        # pprint.pprint(response.__dict__)

        assert response.status_code == 200
        return response
