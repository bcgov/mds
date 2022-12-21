import pytest
from datetime import datetime, timedelta
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from tests.factories import MinePartyAppointmentFactory


@pytest.fixture(scope="function")
def setup_info(db_session):
    eor = MinePartyAppointmentFactory(
        status=MinePartyAppointmentStatus.active,
        mine_party_appt_type_code='EOR'
    )
    eor2 = MinePartyAppointmentFactory(
        status=MinePartyAppointmentStatus.active,
        mine_party_appt_type_code='EOR'
    )

    yield dict(eor=eor, eor2=eor2)

def test_find_expiring_appointments_excludes_inactive_status(setup_info):
    eor = setup_info['eor']

    eor.status = MinePartyAppointmentStatus.inactive
    eor.end_date = datetime.utcnow() + timedelta(days=20)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 0

def test_find_expiring_appointments_finds_end_date_in_range(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=20)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 1
    assert appts[0].mine_party_appt_id == eor.mine_party_appt_id

def test_find_expiring_appointments_excludes_outside_range(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=61)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 0

def test_find_expiring_appointments_excludes_past(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() - timedelta(days=1)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 0

def test_find_expiring_appointments_includes_tomorrow(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=1)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 1

def test_find_expiring_appointments_includes_last_day(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=60)
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 1

def test_find_expiring_appointments_excludes_no_end_date(setup_info):
    eor = setup_info['eor']

    eor.end_date = None
    eor.save()

    appts = MinePartyAppointment.find_expiring_appointments('EOR', 60)

    assert len(appts) == 0

##########
## Expired appointment lookup tests
##########

def test_find_expired_appointments_excludes_no_end_date(setup_info):
    eor = setup_info['eor']

    eor.end_date = None
    eor.save()

    appts = MinePartyAppointment.find_expired_appointments('EOR')

    assert len(appts) == 0

def test_find_expired_appointments_includes_expired_appointment(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() - timedelta(days=1)
    eor.save()

    appts = MinePartyAppointment.find_expired_appointments('EOR')

    assert len(appts) == 1

def test_find_expired_appointments_excludes_non_expired_appointment(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=1)
    eor.save()

    appts = MinePartyAppointment.find_expired_appointments('EOR')

    assert len(appts) == 0

def test_find_expired_appointments_excludes_pending_appointments(setup_info):
    eor = setup_info['eor']

    eor.end_date = datetime.utcnow() + timedelta(days=1)
    eor.status = MinePartyAppointmentStatus.pending
    eor.save()

    appts = MinePartyAppointment.find_expired_appointments('EOR')

    assert len(appts) == 0

def test_find_expired_appointments_includes_multiple(setup_info):
    eor = setup_info['eor']
    eor2 = setup_info['eor2']

    eor.end_date = datetime.utcnow() - timedelta(days=10)
    eor.status = MinePartyAppointmentStatus.active
    eor.save()

    eor2.end_date = datetime.utcnow() - timedelta(days=1)
    eor2.status = MinePartyAppointmentStatus.active
    eor2.save()

    appts = MinePartyAppointment.find_expired_appointments('EOR')

    assert len(appts) == 2
