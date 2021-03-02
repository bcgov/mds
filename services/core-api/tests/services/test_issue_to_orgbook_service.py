from datetime import datetime
from flask import current_app
from unittest.mock import MagicMock, patch, PropertyMock

from app.api.services.issue_to_orgbook_service import OrgBookIssuerService

from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity

from tests.factories import create_mine_and_permit, MinePartyAppointmentFactory


def test_issue_vc_without_orgbook_association_does_nothing(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    MinePartyAppointmentFactory(permit=permit, permittee=True)
    with current_app.test_request_context() as a, patch(
            'app.api.services.issue_to_orgbook_service.requests.post') as mock:
        service = OrgBookIssuerService()
        service.issue_permit_amendment_vc(permit.permit_amendments[0])
        mock.assert_not_called()


class MockResponse():
    status_code = 200


def test_issue_vc_with_orgbook_association_sends_post(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    pmte = MinePartyAppointmentFactory(permit=permit, permittee=True)
    pmte.permittee_orgbook_entity = PartyOrgBookEntity.create('Bx12345', True, datetime.now(),
                                                              12345, 'big company', 12345,
                                                              pmte.party_guid)

    with current_app.test_request_context() as a, patch(
            'app.api.services.issue_to_orgbook_service.requests.post',
            side_effect={MockResponse()}) as mock:
        service = OrgBookIssuerService()
        service.issue_permit_amendment_vc(permit.permit_amendments[0])
        mock.assert_called_once()
