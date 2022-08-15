from datetime import datetime
import json
from enum import Enum
from cerberus import Validator
from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from sqlalchemy.sql import table, column
from app.api.utils.include.user_info import User
from app.api.mines.subscription.models.subscription import Subscription
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine


def validate_document(document):
    schema = {
        'message': {
            'type': 'string'
        },
        'metadata': {
            'type': 'dict',
            'schema': {
                'mine': {
                    'type': 'dict',
                    'schema': {
                        'mine_guid': {
                            'type': 'string',
                            'regex': '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                        },
                        'mine_no': {
                            'type': 'string'
                        },
                        'mine_name': {
                            'type': 'string'
                        }
                    }
                },
                'entity': {
                    'type': 'string',
                },
                'entity_guid': {
                    'type': 'string',
                    'regex': '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                },
                'permit': {
                    'type': 'dict',
                    'schema': {
                        'permit_no': {
                            'type': 'string'
                        }
                    }
                }
            }
        }
    }
    v = Validator(schema, require_all=True)
    if (v.validate(document)):
        return v.document
    else:
        raise ValueError(json.dumps(v.errors))


class ActivityType(Enum):
    mine = 'mine'

    def __str__(self):
        return self.value


class ActivityNotification(AuditMixin, Base):
    __tablename__ = 'activity_notification'
    __table_args__ = {"schema": "activity"}

    notification_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    activity_type = db.Column(db.Enum(ActivityType), nullable=False, default=ActivityType.mine)
    notification_document = db.Column(JSONB(astext_type=db.Text()), nullable=False)
    notification_read = db.Column(db.Boolean(), nullable=False, default=False)
    notification_recipient = db.Column(db.String(60), nullable=False)

    @classmethod
    def create(cls, notification_recipient, notification_document, commit=False):
        validated_notification_document = json.dumps(validate_document(notification_document), indent=2)
        new_activity = cls(notification_recipient=notification_recipient, notification_document=validated_notification_document)
        return new_activity.save(commit)

    @classmethod
    def create_many(cls, mine_guid, document):
        MinespaceUserMineTable = table(MinespaceUserMine.__tablename__, column('mine_guid'), column('user_id'))
        MinespaceUserTable = table(MinespaceUser.__tablename__, column('email_or_username'), column('user_id'))
        SubscriptionTable = table(Subscription.__tablename__, column('mine_guid'), column('user_name'))

        users = [x[0] for x in (db.session.query(MinespaceUserTable, MinespaceUserMineTable).filter(
            MinespaceUserMineTable.c.user_id == MinespaceUserTable.c.user_id,
            MinespaceUserMineTable.c.mine_guid == mine_guid
        ).all())]

        core_users = [x[1] for x in (db.session.query(SubscriptionTable).filter(SubscriptionTable.c.mine_guid == mine_guid).all())]

        users.extend(core_users)
        notifications = []

        for user in users:
            validated_notification_document = validate_document(document)
            formatted_user_name = user.replace('idir\\', '')

            notification = cls(notification_recipient=formatted_user_name, notification_document=validated_notification_document)
            notifications.append(notification)

        db.session.bulk_save_objects(notifications)
        db.session.commit()

    @classmethod
    def find_by_guid(cls, notification_guid):
        return cls.query.filter_by(notification_guid=notification_guid).first()

    def update(self, notification_read=True):
        self.notification_read = notification_read
        self.save()

    @classmethod
    def find_all_by_recipient(cls, user, page, per_page):
        query = cls.query.filter_by(notification_recipient=user).order_by(cls.create_timestamp.desc())

        if (page):
            result = query.paginate(page, per_page, error_out=False)
            return dict([('total', result.total), ('records', result.items)])

        result = query.all()
        return dict([('total', len(result)), ('records', result)])

    def save(self, commit=True):
        self.update_user = User().get_user_username()
        self.update_timestamp = datetime.utcnow()
        super(ActivityNotification, self).save(commit)
