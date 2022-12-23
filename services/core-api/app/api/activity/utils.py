
from .models.activity_notification import ActivityNotification, ActivityRecipients

def trigger_notification(message, activity_type, mine, entity_name, entity_guid, extra_data=None, idempotency_key=None, recipients=ActivityRecipients.all_users, commit=True):
    """
    Triggers a notification for MS and Core users subscribed to the given mine
    
    :param message: A message describing the notification
    :param activity_type: Type of the notification - ActivityType
    :param mine: The mine the notification relates to
    :param entity_name: Name of the entity the notification relates to, e.g. EngineerOfRecord
    :param entity_guid: GUID of the entity the notification relates to
    :param extra_data: Additional data that should be included in the notification e.g. to enable the frontend to route the user on click
    :param idempotency_key: String that should determine whether or not a user has already received the given notifciation. If triggering a notification for the same user with the same idempotency_key, the second notification will not be sent.
    :param recipients: Send notification to all user types, or only recipients on Minespace or Core - ActivityRecipients
    :param commit: Whether or not to commit the transaction on success, or leave it up to the caller
    """
    document = {
        'message': message,
        'activity_type': activity_type,
        'metadata': {
            'mine': {
                'mine_guid': str(mine.mine_guid),
                'mine_no': mine.mine_no,
                'mine_name': mine.mine_name
            },
            'entity': entity_name,
            'entity_guid': str(entity_guid),
            **(extra_data or {})
        }
    }

    return ActivityNotification.create_many(
        mine.mine_guid,
        activity_type,
        document,
        idempotency_key,
        commit=commit,
        recipients=recipients
    )
