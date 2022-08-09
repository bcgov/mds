
from .models.activity_notification import ActivityNotification


def trigger_notifcation(message, mine, entity_name, entity_guid, extra_data=None):
    document = {
        'message': message,
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

    ActivityNotification.create_many(mine.mine_guid, document)
