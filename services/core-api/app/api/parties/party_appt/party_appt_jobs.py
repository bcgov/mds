
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus
from app.api.activity.models.activity_notification import ActivityType
from app.api.activity.utils import trigger_notifcation
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import db


class PartyAppointmentJobs():
    def notify_expiring_party_appointments(self):
        expiring_parties = MinePartyAppointment.find_expiring_appointments('EOR', 60)
        message = lambda party: f'60 days notice Engineer of Record expiry for {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'

        return list(self._notify_party_appointments(expiring_parties, message, ActivityType.eor_expiring_60_days))


    def notify_and_update_expired_party_appointments(self):
        expired_parties = MinePartyAppointment.find_expired_appointments('EOR')

        MinePartyAppointment.update_status_many(
            [p.mine_party_appt_id for p in expired_parties],
            MinePartyAppointmentStatus.inactive,
            commit=False
        )

        notifications = list(self.notify_expired_party_appointments(expired_parties))

        db.session.commit()

        return list(notifications)

    def notify_expired_party_appointments(self, expired_parties):
        message = lambda party: f'Engineer of Record expired on {party.mine_tailings_storage_facility.mine_tailings_storage_facility_name} at {party.mine.mine_name}'

        return list(self._notify_party_appointments(expired_parties, message, ActivityType.tsf_eor_expired))

    def _notify_party_appointments(self, parties, message, activity_type):
        created_notifications = [] 
        for party in parties:
            idempotency_key = f'{activity_type}_{party.mine_party_appt_guid}_{party.end_date.strftime("%Y-%m-%d")}'

            nots = trigger_notifcation(message(party), activity_type, party.mine, 'EngineerOfRecord', party.mine_party_appt_guid,
                {
                    'mine_tailings_storage_facility': {
                        'mine_tailings_storage_facility_guid': str(party.mine_tailings_storage_facility_guid),
                    },
                    'permit': {
                        'permit_no': party.mine_tailings_storage_facility.mines_act_permit_no
                    }
                },
                idempotency_key=idempotency_key,
                commit=False
            )

            created_notifications.extend(nots)
        return created_notifications
