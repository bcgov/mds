from unittest import mock, TestCase
import pytest
from datetime import datetime, timedelta

from app.api.activity.models.activity_notification import ActivityType
from tests.factories import SubscriptionFactory
from app.api.activity.models.activity_notification import ActivityNotification
from tests.factories import MineTailingsStorageFacilityFactory
from tests.factories import MineFactory
from app.api.parties.party_appt.party_appt_jobs import PartyAppointmentJobs
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from tests.factories import MinePartyAppointmentFactory

@pytest.fixture(scope="function")
def setup_info(db_session):
    mine = MineFactory(
        mine_name='TestMine'
    )

    tsf = MineTailingsStorageFacilityFactory(
        mine_tailings_storage_facility_name='TestFacility',
        mines_act_permit_no='123abc',
        mine=mine
    )

    eor = MinePartyAppointmentFactory(
        status=MinePartyAppointmentStatus.active,
        mine=mine,
        mine_party_appt_type_code='EOR',
        mine_tailings_storage_facility=tsf,
        end_date = datetime.utcnow() + timedelta(days=20)
    )

    yield dict(eor=eor, mine=mine, tsf=tsf)

@pytest.fixture(scope="function")
def expired_eor_info(setup_info):
    eor = setup_info['eor']
    eor.end_date = datetime.utcnow() - timedelta(days=1)
    eor.save()
    yield setup_info

@pytest.fixture(scope="function")
def db_session(db_session):
    # Fixes a Instance is not bound to a session error that pops up
    # with the celery/pytest/flask combination
    # https://github.com/jeancochrane/pytest-flask-sqlalchemy/issues/27
    with mock.patch.object(db_session, "remove", lambda: None):
        yield db_session

class TestExpiringPartyAppointment():

    def test_notify_expiring_party_appointments_triggers_notification_when_expiring(self, setup_info):
        with mock.patch('app.api.parties.party_appt.models.mine_party_appt.MinePartyAppointment.find_expiring_appointments') as expiring_appointment_mock:
            with  mock.patch('app.api.parties.party_appt.party_appt_jobs.trigger_notification') as trigger_mock:
                expiring_appointment_mock.side_effect = [[setup_info['eor']]]
                
                PartyAppointmentJobs().notify_expiring_party_appointments()

                idempotency_key = f'eor_expiring_60_days_{setup_info["eor"].mine_party_appt_guid}_{setup_info["eor"].end_date.strftime("%Y-%m-%d")}'
        
                trigger_mock.assert_called_once_with('60 days notice Engineer of Record expiry for TestFacility at TestMine', ActivityType.eor_expiring_60_days, setup_info['mine'], 'EngineerOfRecord', setup_info['eor'].mine_party_appt_guid, {
                    'mine_tailings_storage_facility': {
                        'mine_tailings_storage_facility_guid': str(setup_info['tsf'].mine_tailings_storage_facility_guid)
                    },
                    'permit': {
                        'permit_no': '123abc'
                    }
                },
                commit=False,
                idempotency_key=idempotency_key)

    def test_notify_expiring_party_appointments_does_not_trigger_when_not_expiring(self, setup_info):
        with mock.patch('app.api.parties.party_appt.models.mine_party_appt.MinePartyAppointment.find_expiring_appointments') as expiring_appointment_mock:
            with mock.patch('app.api.parties.party_appt.party_appt_jobs.trigger_notification') as trigger_mock:
                expiring_appointment_mock.side_effect = [[]]

                PartyAppointmentJobs().notify_expiring_party_appointments()

                trigger_mock.assert_not_called()

    def test_notify_expiring_should_not_trigger_without_parties(self, setup_info):
        PartyAppointmentJobs().notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 0)

    def test_notify_expiring_should_trigger_for_subscriber(self, setup_info):
        SubscriptionFactory(mine=setup_info['mine'])
        PartyAppointmentJobs().notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 1)

    def test_notify_expiring_should_trigger_for_subscriber_doesnt_duplicate(self, setup_info):
        SubscriptionFactory(mine=setup_info['mine'])
        PartyAppointmentJobs().notify_expiring_party_appointments()
        PartyAppointmentJobs().notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 1)


class TestExpiredEor():
    def test_notify_expired_notifies_when_expired(self, expired_eor_info):
        SubscriptionFactory(mine=expired_eor_info['mine'])
        PartyAppointmentJobs().notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 1)

    def test_notify_expired_does_not_notify_when_active(self, expired_eor_info):
        eor = expired_eor_info['eor']
        eor.end_date = datetime.utcnow() + timedelta(days=1)
        eor.save()

        SubscriptionFactory(mine=expired_eor_info['mine'])
        PartyAppointmentJobs().notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 0)

    def test_notify_expired_flips_expired_to_inactive(self, expired_eor_info):
        SubscriptionFactory(mine=expired_eor_info['mine'])

        appts = MinePartyAppointment.find_expired_appointments('EOR')
        assert len(appts) == 1
        assert appts[0].status == MinePartyAppointmentStatus.active

        PartyAppointmentJobs().notify_and_update_expired_party_appointments()

        appt = MinePartyAppointment.find_by_mine_party_appt_guid(appts[0].mine_party_appt_guid)

        assert appt.status == MinePartyAppointmentStatus.inactive

        assert(ActivityNotification.count() == 1)
    
    def test_notify_expired_party_appointments_triggers_correct_notification_data(self, expired_eor_info):
        sub = SubscriptionFactory(mine=expired_eor_info['mine'])
        appts = list(PartyAppointmentJobs().notify_and_update_expired_party_appointments())

        assert(len(appts) == 1)

        eor = expired_eor_info['eor']
        notification = ActivityNotification.find_by_guid(appts[0].notification_guid)

        idempotency_key = f'tsf_eor_expired_{eor.mine_party_appt_guid}_{eor.end_date.strftime("%Y-%m-%d")}'

        assert notification.idempotency_key == idempotency_key
        assert notification.activity_type == ActivityType.tsf_eor_expired
        assert notification.notification_recipient == sub.user_name

        mine = expired_eor_info['mine']

        tst = TestCase()
        tst.maxDiff = None

        tst.assertDictEqual(notification.notification_document, {
            'message': 'Engineer of Record expired on TestFacility at TestMine',
            'activity_type': str(ActivityType.tsf_eor_expired),
            'metadata': {
                'mine': {
                    'mine_guid': str(mine.mine_guid),
                    'mine_no': mine.mine_no,
                    'mine_name': mine.mine_name
                },
                'entity': 'EngineerOfRecord',
                'entity_guid': str(eor.mine_party_appt_guid),
                'permit': {
                    'permit_no': '123abc'
                },
                'mine_tailings_storage_facility': {
                    'mine_tailings_storage_facility_guid': str(expired_eor_info['tsf'].mine_tailings_storage_facility_guid)
                }
            }
        })
