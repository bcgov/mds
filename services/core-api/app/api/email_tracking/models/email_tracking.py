from datetime import timedelta, datetime, timezone
from enum import Enum

from pytz import utc
from sqlalchemy import desc, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class EmailStatus(Enum):
    sent = 'sent'
    accepted = 'accepted'
    cancelled = 'cancelled'
    completed = 'completed'
    pending = 'pending'
    failed = 'failed'

    def __str__(self):
        return self.value


class RecipientType(Enum):
    primary = 'primary'
    cc = 'cc'
    bcc = 'bcc'

    def __str__(self):
        return self.value


class EmailTracking(AuditMixin, Base):
    __tablename__ = "email_tracking"

    email_tracking_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())

    # Generic reference to tracked entity
    reference_id = db.Column(db.String(100), nullable=True)
    reference_table = db.Column(db.String(100), nullable=True)
    reference_email_type = db.Column(db.String(255), nullable=True  )

    email_template_name = db.Column(db.String(255), nullable=True)
    email_subject = db.Column(db.String(500))

    recipient_email = db.Column(db.String(320), nullable=False)  # RFC 5321 max email length
    recipient_name = db.Column(db.String(255))
    recipient_type = db.Column(db.Enum(RecipientType), nullable=False, default=RecipientType.primary)

    email_status = db.Column(db.Enum(EmailStatus), nullable=False, default=EmailStatus.pending)
    sent_timestamp = db.Column(db.DateTime(timezone=True))
    delivered_timestamp = db.Column(db.DateTime(timezone=True))
    failed_timestamp = db.Column(db.DateTime(timezone=True))

    error_message = db.Column(db.Text)

    ches_message_id = db.Column(UUID(as_uuid=True))
    ches_transaction_id = db.Column(UUID(as_uuid=True))

    distribution_list_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('distribution_list.distribution_list_guid'), nullable=True)

    retry_count = db.Column(db.Integer, default=0)
    max_retries = db.Column(db.Integer, default=3)

    @classmethod
    def create(cls,
               reference_id,
               reference_table,
               reference_email_type,
               email_template_name,
               recipient_email,
               email_subject=None,
               recipient_name=None,
               recipient_type=RecipientType.primary,
               max_retries=3,
               distribution_list_guid=None,
               add_to_session=True):
        new_email_tracking = cls(
            reference_id=reference_id,
            reference_table=reference_table,
            reference_email_type=reference_email_type,
            email_template_name=email_template_name,
            recipient_email=recipient_email,
            email_subject=email_subject,
            recipient_name=recipient_name,
            recipient_type=recipient_type,
            max_retries=max_retries,
            distribution_list_guid=distribution_list_guid,
            email_status=EmailStatus.pending
        )

        if add_to_session:
            new_email_tracking.save()

        return new_email_tracking

    @classmethod
    def find_all(cls,
                 reference_id=None,
                 reference_table=None,
                 email_status=None,
                 email_template_name=None,
                 recipient_email=None):
        query = cls.query.order_by(desc(cls.create_timestamp))
        string_reference_id = str(reference_id) if reference_id else None

        if reference_id:
            query = query.filter_by(reference_id=string_reference_id)
        if reference_table:
            query = query.filter_by(reference_table=reference_table)
        if email_status:
            query = query.filter_by(email_status=email_status)
        if email_template_name:
            query = query.filter_by(email_template_name=email_template_name)
        if recipient_email:
            query = query.filter_by(recipient_email=recipient_email)

        result = query.all()
        return dict([('total', len(result)), ('records', result)])

    @classmethod
    def find_latest_by_reference(cls, reference_id, reference_table, email_reference_type):
        string_reference_id = str(reference_id) if reference_id else None
        """Find the latest email tracking record for a specific entity"""
        query = cls.query.filter(
            and_(
                cls.reference_id == string_reference_id,
                cls.reference_table == reference_table,
                cls.reference_email_type == email_reference_type
            )
        ).order_by(desc(cls.create_timestamp))
        return query.first()

    @classmethod
    def find_by_ches_message_id(cls, ches_message_id):
        """Find email tracking record by CHES message ID"""
        return cls.query.filter_by(ches_message_id=ches_message_id).first()

    def update_status(self, status, timestamp_field=None, error_message=None, error_code=None):
        """Update email status and related timestamp"""
        self.email_status = status

        if timestamp_field and hasattr(self, timestamp_field):
            setattr(self, timestamp_field, db.func.now())

        if error_message:
            self.error_message = error_message
        if error_code:
            self.error_code = error_code

        self.save()

    def mark_as_sent(self, ches_message_id=None, ches_transaction_id=None):
        """Mark email as sent"""
        self.email_status = EmailStatus.sent
        self.sent_timestamp = db.func.now()

        if ches_message_id:
            self.ches_message_id = ches_message_id
        if ches_transaction_id:
            self.ches_transaction_id = ches_transaction_id

        self.save()

    def mark_as_delivered(self, updated_timestamp=None):
        """Mark email as delivered"""
        self.email_status = EmailStatus.completed
        self.delivered_timestamp = updated_timestamp if updated_timestamp else db.func.now()
        self.save()

    def mark_as_failed(self, error_message=None, increment_retry=True, updated_timestamp=None):
        """Mark email as failed"""
        self.email_status = EmailStatus.failed
        self.failed_timestamp = updated_timestamp if updated_timestamp else db.func.now()

        if error_message:
            self.error_message = error_message

        if increment_retry:
            self.retry_count += 1

        self.save()

    def update(self, **kwargs):
        """Update email tracking record with provided kwargs"""
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.save()

    def check_email_sent_within_timeframe(self, timeframe=24):
        """Check if email was sent within the timeframe in hours (default: 24)"""
        return (self.sent_timestamp + timedelta(hours=timeframe)) > datetime.now(utc)