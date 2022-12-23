from app.api.activity.models.activity_notification import ActivityType, ActivityRecipients
from app.api.activity.utils import trigger_notification
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment, MinePartyAppointmentStatus
from app.extensions import db
from app.tasks.celery import celery



@celery.task()
def notify_expiring_party_appointments():
    expiring_eors = MinePartyAppointment.find_expiring_appointments('EOR', 60)
    expiring_qps = MinePartyAppointment.find_expiring_appointments('TQP', 60)
    
    eor_message = lambda party: f'60 days notice Engineer of Record expiry for {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'
    qp_message = lambda party: f'60 days notice Qualified Person expiry for {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'

    eor_notifications = list(_notify_party_appointments(expiring_eors, eor_message, ActivityType.eor_expiring_60_days, ActivityRecipients.minespace_users))
    qp_notifications = list(_notify_party_appointments(expiring_qps, qp_message, ActivityType.qp_expiring_60_days, ActivityRecipients.minespace_users))
    notifications = eor_notifications + qp_notifications

    db.session.commit()

    return notifications

@celery.task()
def notify_and_update_expired_party_appointments():
    expired_eors = MinePartyAppointment.find_expired_appointments('EOR')
    expired_qps = MinePartyAppointment.find_expired_appointments('TQP')
    expired_parties = expired_eors + expired_qps

    MinePartyAppointment.update_status_many(
        [p.mine_party_appt_id for p in expired_parties],
        MinePartyAppointmentStatus.inactive,
        commit=False
    )

    eor_message = lambda party: f'Engineer of Record expired on {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'
    qp_message = lambda party: f'The term date has elapsed with the Qualified Person for {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'

    eor_notifications = list(_notify_party_appointments(expired_eors, eor_message, ActivityType.tsf_eor_expired))
    qp_notifications = list(_notify_party_appointments(expired_qps, qp_message, ActivityType.tsf_qp_expired))
    
    notifications = eor_notifications + qp_notifications

    db.session.commit()

    return list(notifications)

def _notify_party_appointments(parties, message, activity_type, recipients=ActivityRecipients.all_users):
    created_notifications = [] 
    for party in parties:
        idempotency_key = f'{activity_type}_{party.mine_party_appt_guid}_{party.end_date.strftime("%Y-%m-%d")}'

        nots = trigger_notification(message(party), activity_type, party.mine, _get_party_name(party), party.mine_party_appt_guid,
            {
                'mine_tailings_storage_facility': {
                    'mine_tailings_storage_facility_guid': str(party.mine_tailings_storage_facility_guid),
                },
                'permit': {
                    'permit_no': party.mine_tailings_storage_facility.mines_act_permit_no
                }
            },
            idempotency_key=idempotency_key,
            recipients=recipients,
            commit=False            
        )

        created_notifications.extend(nots)
    return created_notifications

def _get_party_name(party):
    party_names = {
        'EOR': 'EngineerOfRecord',
        'TQP': 'QualifiedPerson'
    }
    return party_names.get(party.mine_party_appt_type_code)