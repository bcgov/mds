import pytest
import uuid

from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from tests.factories import MinePartyAppointmentFactory


# Party Model Class Methods
def test_party_appt_model_find_by_party_guid(db_session):
    party_guid = MinePartyAppointmentFactory().party.party_guid

    mpas = MinePartyAppointment.find_by_party_guid(str(party_guid))
    assert len(mpas) == 1
    assert mpas[0].party_guid == party_guid


def test_party_appt_model_find_by_mine_guid(db_session):
    mine_guid = MinePartyAppointmentFactory().mine.mine_guid

    mpas = MinePartyAppointment.find_by_mine_guid(str(mine_guid))
    assert len(mpas) == 1
    assert mpas[0].mine_guid == mine_guid


def test_party_appt_model_find_by(db_session):
    batch_size = 3
    MinePartyAppointmentFactory.create_batch(size=batch_size)

    mine_party_appts = MinePartyAppointment.find_by()
    assert len(mine_party_appts) == batch_size


def test_mine_party_appt_to_csv(db_session):
    mpa = MinePartyAppointmentFactory()

    csv = MinePartyAppointment.to_csv([mpa], ['processed_by', 'processed_on'])
    second_row = str(mpa.processed_by) + ',' + str(mpa.processed_on)
    assert csv == "processed_by,processed_on\n" + second_row
