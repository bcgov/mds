import requests, json, pprint, time, threading

from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from flask import request, current_app
from app.config import Config

ORGBOOK_W3C_CRED_POST = Config.ORGBOOK_API_URL + "/credentials"


class OrgBookIssuerService():
    """This class is used to connect to an issuer controller, which handles the nuance and handshakes involved with issuing
    verifiable credentials to a Verifiable Credential Registry (VRC), OrgBook is an instance of aries-vrc (https://github.com/bcgov/aries-vcr).
    Mines-Digital-Trust has stood up an Issuer Controller API (https://github.com/bcgov/aries-vcr-issuer-controller) to serve CORE to issue 
    Mines Act Permits as VC's."""

    issuer_controller_url = Config.VCR_ISSUER_URL    #FROM DeployConfig
    issuer_secret_key = Config.VCR_ISSUER_SECRET_KEY #FROM SECRET
    vc_schema_name = "bcgov-mines-act-permit.bcgov-mines-permitting"
    vc_schema_version = "0.2.1"
    issuer_controller_ready = False

    def __init__(self):
        retry_count = 0
        while retry_count < 5:
            retry_count += 1
            response = requests.get(self.issuer_controller_url + 'liveness')
            if response.status_code != 200:
                current_app.logger.warning('Issuer Controller not live: ' +
                                           str(response.status_code))
                time.sleep(.500 * retry_count)
                continue
            #check api key
            response = requests.get(
                self.issuer_controller_url + 'status',
                headers={
                    'issuer_secret_key': self.issuer_secret_key,
                })
            if response.status_code == 200:
                self.issuer_controller_ready = True
                current_app.logger.info('Issuer Controller ready and secret-key correct!')
                return
            elif response.status_code != 503:
                current_app.logger.error('Livenesscheck failed: ' + str(response.status_code))
            time.sleep(.500 * retry_count)
        current_app.logger.error('Issuer Controller liveness check failed, nothing will be issued')

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
        if not self.issuer_controller_ready:
            current_app.logger.warning(
                'Issuer Controller liveness check failed on init, this call did nothing')
        permittee_orgbook_entity = permit_amendment.permit.permittee_appointments[
            0].party.party_orgbook_entity
        if not permittee_orgbook_entity:
            current_app.logger.warning(
                'skipping issue_permit_amendment_vc, permittee not link to orgbook business')
            return

        inspector_name = permit_amendment.issuing_inspector_name

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
                "inspector_name": inspector_name
            }
        }])

        current_app.logger.debug('issuing-credential to OrgBook business \'' +
                                 permittee_orgbook_entity.registration_id + ',' +
                                 permittee_orgbook_entity.name_text + '\'')
        response = requests.post(
            self.issuer_controller_url + 'issue-credential',
            data=payload,
            headers={
                'issuer_secret_key': self.issuer_secret_key,
                'Content-Type': 'application/json'
            })
        current_app.logger.debug('issue-credential call returned successfully')
        return response

    def publish_untp_dcc_to_orgbook(self, payload):
        resp = requests.post(
            ORGBOOK_W3C_CRED_POST, json=payload, headers={'Content-Type': 'application/json'})
        assert resp.status_code == 201, f"Error publishing to OrgBook: {resp.text}"
