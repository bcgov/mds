from datetime import datetime
import json
from enum import Enum

from sqlalchemy import func
from flask import has_request_context
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
            'required': True,
            'type': 'string'
        },
        'activity_type': {
            'required': True,
            'type': 'string'
        },
        'metadata': {
            'required': True,
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
                    'required': True,
                    'type': 'string',
                },
                'entity_guid': {
                    'required': True,
                    'type': 'string',
                    'regex': '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                },
                'permit': {
                    'required': False,
                    'type': 'dict',
                    'schema': {
                        'permit_no': {
                            'type': 'string',
                            'nullable': True
                        }
                    }
                },
                'project': {
                    'required': False,
                    'type': 'dict',
                    'schema': {
                        'project_guid': {
                            'type': 'string'
                        }
                    }
                },
                'mine_tailings_storage_facility': {
                    'required': False,
                    'type': 'dict',
                    'schema': {
                        'mine_tailings_storage_facility_guid': {
                            'type': 'string'
                        }
                    }
                }
            }
        }
    }
    v = Validator(schema)
    if (v.validate(document)):
        return v.document
    else:
        raise ValueError(json.dumps(v.errors))


class ActivityType(str, Enum):
    mine = 'mine'
    eor_expiring_60_days = 'eor_expiring_60_days'
    tsf_eor_expired = 'tsf_eor_expired'
    qp_expiring_60_days = 'qp_expiring_60_days'
    tsf_qp_expired = 'tsf_qp_expired'
    incident_report_submitted = 'incident_report_submitted'
    mine_incident_created = 'mine_incident_created'
    nod_status_changed = 'nod_status_changed'
    eor_created = 'eor_created'
    qfp_created = 'qfp_created'
    nod_submitted = 'nod_submitted'
    ir_table_submitted = 'ir_table_submitted'
    major_mine_app_submitted = 'major_mine_app_submitted'
    major_mine_desc_submitted = 'major_mine_desc_submitted'

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
    idempotency_key = db.Column(db.String(120), nullable=True)

    @classmethod
    def create(cls, notification_recipient, notification_document, commit=False):
        validated_notification_document = json.dumps(validate_document(notification_document), indent=2)
        new_activity = cls(notification_recipient=notification_recipient, notification_document=validated_notification_document)
        return new_activity.save(commit)

    @classmethod
    def create_many(cls, mine_guid, activity_type, document, idempotency_key=None, commit=True):
        MinespaceUserMineTable = table(MinespaceUserMine.__tablename__, column('mine_guid'), column('user_id'))
        MinespaceUserTable = table(MinespaceUser.__tablename__, column('email_or_username'), column('user_id'))
        SubscriptionTable = table(Subscription.__tablename__, column('mine_guid'), column('user_name'))

        users = [x[0] for x in (db.session.query(MinespaceUserTable, MinespaceUserMineTable).filter(
            MinespaceUserMineTable.c.user_id == MinespaceUserTable.c.user_id,
            MinespaceUserMineTable.c.mine_guid == mine_guid
        ).all())]

        core_users = [x[1] for x in (db.session.query(SubscriptionTable).filter(SubscriptionTable.c.mine_guid == mine_guid).all())]

        # Look up users that already recieved a notification with the given idempotency key
        # so they will not receive the notification again
        already_sent_notification_recipients = [res[0] for res in cls.query \
            .with_entities(cls.notification_recipient) \
            .filter_by(idempotency_key=idempotency_key) \
            .all()] if idempotency_key else []

        users.extend(core_users)
        notifications = []

        for user in users:
            validated_notification_document = validate_document(document)
            formatted_user_name = user.replace('idir\\', '')

            if formatted_user_name not in already_sent_notification_recipients:
                notification = cls(notification_recipient=formatted_user_name, notification_document=validated_notification_document, idempotency_key=idempotency_key, activity_type=activity_type)
                notifications.append(notification)

        if len(notifications) > 0:
            db.session.bulk_save_objects(notifications, return_defaults = True)

            if commit:
                db.session.commit()
        
        return notifications

    @classmethod
    def find_by_guid(cls, notification_guid):
        return cls.query.filter_by(notification_guid=notification_guid).first()

    def update(self, notification_read=True):
        self.notification_read = notification_read
        self.save()

    @classmethod
    def mark_as_read_many(cls, activity_guids):
        cls.query.filter(ActivityNotification.notification_guid.in_(activity_guids)).update({'notification_read': True}, synchronize_session=False)
        db.session.commit()

    @classmethod
    def find_all_by_recipient(cls, user, page, per_page):
        query = cls.query.filter_by(notification_recipient=user).order_by(cls.create_timestamp.desc())

        if (page):
            result = query.paginate(page, per_page, error_out=False)
            return dict([('total', result.total), ('records', result.items)])

        result = query.all()
        return dict([('total', len(result)), ('records', result)])

    @classmethod
    def count(cls):
        return cls.query.count()

    def save(self, commit=True):
        if has_request_context():
            # Set 'system' as sender if notification is triggered 
            # outside the context of a web request, e.g. when triggered from a job
            self.update_user = 'system'
        else:
            self.update_user = User().get_user_username()
        self.update_timestamp = datetime.utcnow()
        super(ActivityNotification, self).save(commit)
