import pytest
import uuid

from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from tests.factories import MinePartyAppointmentFactory


# Permit Model Class Methods
def test_permittee_model_find_by_permit_guid(test_client, db_session, auth_headers):
    appt_guid = MinePartyAppointmentFactory(mine_party_appt_type_code='PMT').mine_party_appt_guid

    permittee = MinePartyAppointment.find_by_mine_party_appt_guid(str(appt_guid))
    assert permittee.mine_party_appt_guid == appt_guid
