from unittest import mock, TestCase
import pytest
from datetime import datetime, timedelta

from app.api.parties.party_appt.tasks import notify_expiring_party_appointments, notify_and_update_expired_party_appointments

from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from tests.factories import SubscriptionFactory, MinespaceSubscriptionFactory
from app.api.activity.models.activity_notification import ActivityNotification
from tests.factories import MineTailingsStorageFacilityFactory
from tests.factories import MineFactory
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from tests.factories import MinePartyAppointmentFactory
from app.api.users.minespace.models.minespace_user import MinespaceUser

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

    qp = MinePartyAppointmentFactory(
        status=MinePartyAppointmentStatus.active,
        mine=mine,
        mine_party_appt_type_code='TQP',
        mine_tailings_storage_facility=tsf,
        end_date = datetime.utcnow() + timedelta(days=20)
    )

    yield dict(eor=eor, qp=qp, mine=mine, tsf=tsf)

@pytest.fixture(scope="function")
def expired_eor_info(setup_info):
    eor = setup_info['eor']
    eor.end_date = datetime.utcnow() - timedelta(days=1)
    eor.save()
    yield setup_info

@pytest.fixture(scope="function")
def expired_qp_info(setup_info):
    qp = setup_info['qp']
    qp.end_date = datetime.utcnow() - timedelta(days=1)
    qp.save()
    yield setup_info

@pytest.fixture(scope="function")
def db_session(db_session):
    # Fixes a Instance is not bound to a "Instance is not bound to a session" error that pops up
    # with the celery/pytest/flask combination
    # https://github.com/jeancochrane/pytest-flask-sqlalchemy/issues/27
    with mock.patch.object(db_session, "remove", lambda: None):
        yield db_session

class TestExpiringPartyAppointment():

    def test_notify_expiring_party_appointments_triggers_notification_when_expiring(self, setup_info):
        with mock.patch('app.api.parties.party_appt.models.mine_party_appt.MinePartyAppointment.find_expiring_appointments') as expiring_appointment_mock:
            with  mock.patch('app.api.parties.party_appt.tasks.trigger_notification') as trigger_mock:
                expiring_appointment_mock.side_effect = [[setup_info['eor']], [setup_info['qp']]]
                
                notify_expiring_party_appointments()

                eor_idempotency_key = f'eor_expiring_60_days_{setup_info["eor"].mine_party_appt_guid}_{setup_info["eor"].end_date.strftime("%Y-%m-%d")}'
                qp_idempotency_key = f'qp_expiring_60_days_{setup_info["qp"].mine_party_appt_guid}_{setup_info["qp"].end_date.strftime("%Y-%m-%d")}'

                assert(trigger_mock.call_count == 2)

                eor_call = mock.call(
                    '60 days notice Engineer of Record expiry for TestFacility at TestMine', ActivityType.eor_expiring_60_days, setup_info['mine'], 'EngineerOfRecord', setup_info['eor'].mine_party_appt_guid, {
                        'mine_tailings_storage_facility': {
                            'mine_tailings_storage_facility_guid': str(setup_info['tsf'].mine_tailings_storage_facility_guid)
                        },
                        'permit': {
                            'permit_no': '123abc'
                        }
                    },
                    commit=False,
                    recipients=ActivityRecipients.minespace_users,
                    idempotency_key=eor_idempotency_key)

                qp_call = mock.call(
                    '60 days notice Qualified Person expiry for TestFacility at TestMine', ActivityType.qp_expiring_60_days, setup_info['mine'], 'QualifiedPerson', setup_info['qp'].mine_party_appt_guid, {
                        'mine_tailings_storage_facility': {
                            'mine_tailings_storage_facility_guid': str(setup_info['tsf'].mine_tailings_storage_facility_guid)
                        },
                        'permit': {
                            'permit_no': '123abc'
                        }
                    },
                    commit=False,
                    recipients=ActivityRecipients.minespace_users,
                    idempotency_key=qp_idempotency_key)

                trigger_mock.assert_has_calls([eor_call, qp_call], any_order=True)

    def test_notify_expiring_party_appointments_does_not_trigger_when_not_expiring(self, setup_info):
        with mock.patch('app.api.parties.party_appt.models.mine_party_appt.MinePartyAppointment.find_expiring_appointments') as expiring_appointment_mock:
            with mock.patch('app.api.parties.party_appt.tasks.trigger_notification') as trigger_mock:
                expiring_appointment_mock.side_effect = [[], [], [], []]
                notify_expiring_party_appointments()

                notify_expiring_party_appointments()

                trigger_mock.assert_not_called()

    def test_notify_expiring_should_not_trigger_without_parties(self, setup_info):
        notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 0)

    def test_notify_expiring_should_trigger_for_minespace_subscriber(self, setup_info):
        MinespaceSubscriptionFactory(mine=setup_info['mine'])
        notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 2)

    def test_notify_expiring_should_not_trigger_for_core_subscriber(self, setup_info):
        SubscriptionFactory(mine=setup_info['mine'])
        notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 0)

    def test_notify_expiring_should_trigger_for_subscriber_doesnt_duplicate(self, setup_info):
        MinespaceSubscriptionFactory(mine=setup_info['mine'])
        notify_expiring_party_appointments()
        notify_expiring_party_appointments()

        assert(ActivityNotification.count() == 2)

class TestExpiredQP():
    def test_notify_expired_notifies_when_qp_expired_core(self, expired_qp_info):
        SubscriptionFactory(mine=expired_qp_info['mine'])
        notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 1)

    def test_notify_expired_notifies_when_qp_expired_minespace(self, expired_qp_info):
        MinespaceSubscriptionFactory(mine=expired_qp_info['mine'])
        notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 1)

    def test_notify_expired_qp_triggers_correct_notification_data(self, expired_qp_info):
        sub = MinespaceSubscriptionFactory(mine=expired_qp_info['mine'])

        appts = list(notify_and_update_expired_party_appointments())

        assert(len(appts) == 1)

        qp = expired_qp_info['qp']
        notification = ActivityNotification.find_by_guid(appts[0].notification_guid)

        idempotency_key = f'tsf_qp_expired_{qp.mine_party_appt_guid}_{qp.end_date.strftime("%Y-%m-%d")}'

        user_name = MinespaceUser.find_by_id(sub.user_id).email_or_username

        assert notification.idempotency_key == idempotency_key
        assert notification.activity_type == ActivityType.tsf_qp_expired
        assert notification.notification_recipient == user_name

        mine = expired_qp_info['mine']

        tst = TestCase()
        tst.maxDiff = None

        tst.assertDictEqual(notification.notification_document, {
            'message': 'The term date has elapsed with the Qualified Person for TestFacility at TestMine',
            'activity_type': str(ActivityType.tsf_qp_expired),
            'metadata': {
                'mine': {
                    'mine_guid': str(mine.mine_guid),
                    'mine_no': mine.mine_no,
                    'mine_name': mine.mine_name
                },
                'entity': 'QualifiedPerson',
                'entity_guid': str(qp.mine_party_appt_guid),
                'permit': {
                    'permit_no': '123abc'
                },
                'mine_tailings_storage_facility': {
                    'mine_tailings_storage_facility_guid': str(expired_qp_info['tsf'].mine_tailings_storage_facility_guid)
                }
            }
        })

class TestExpiredEor():
    def test_notify_expired_notifies_when_expired(self, expired_eor_info):
        SubscriptionFactory(mine=expired_eor_info['mine'])
        notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 1)

    def test_notify_expired_does_not_notify_when_active(self, expired_eor_info):
        eor = expired_eor_info['eor']
        eor.end_date = datetime.utcnow() + timedelta(days=1)
        eor.save()

        SubscriptionFactory(mine=expired_eor_info['mine'])
        notify_and_update_expired_party_appointments()

        assert(ActivityNotification.count() == 0)

    def test_notify_expired_flips_expired_to_inactive(self, expired_eor_info):
        SubscriptionFactory(mine=expired_eor_info['mine'])

        appts = MinePartyAppointment.find_expired_appointments('EOR')
        assert len(appts) == 1
        assert appts[0].status == MinePartyAppointmentStatus.active

        notify_and_update_expired_party_appointments()

        appt = MinePartyAppointment.find_by_mine_party_appt_guid(appts[0].mine_party_appt_guid)

        assert appt.status == MinePartyAppointmentStatus.inactive

        assert(ActivityNotification.count() == 1)
    
    def test_notify_expired_party_appointments_triggers_correct_notification_data(self, expired_eor_info):
        sub = SubscriptionFactory(mine=expired_eor_info['mine'])
        appts = list(notify_and_update_expired_party_appointments())

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
