import uuid
from datetime import datetime, timedelta

import pytest
from pytz import utc

from app.api.email_tracking.models.email_tracking import EmailTracking, EmailStatus, RecipientType
from tests.factories import EmailTrackingFactory, MajorMineApplicationFactory, ProjectSummaryFactory


def test_email_tracking_create(db_session):
    """Test creating an EmailTracking record"""
    email_tracking = EmailTrackingFactory()

    assert email_tracking.email_tracking_id is not None
    assert email_tracking.reference_id is not None
    assert email_tracking.reference_table == 'major_mine_application'
    assert email_tracking.recipient_email is not None
    assert email_tracking.email_status == EmailStatus.pending


def test_email_tracking_create_class_method(db_session):
    """Test the create class method"""
    mma = MajorMineApplicationFactory()

    email_tracking = EmailTracking.create(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        reference_email_type='mma_submit_email',
        email_template_name='submit_confirmation',
        recipient_email='test@example.com',
        email_subject='Test Subject',
        recipient_name='Test User',
        recipient_type=RecipientType.primary
    )

    assert email_tracking.reference_id == mma.major_mine_application_guid
    assert email_tracking.reference_table == 'major_mine_application'
    assert email_tracking.reference_email_type == 'mma_submit_email'
    assert email_tracking.email_template_name == 'submit_confirmation'
    assert email_tracking.recipient_email == 'test@example.com'
    assert email_tracking.email_subject == 'Test Subject'
    assert email_tracking.recipient_name == 'Test User'
    assert email_tracking.recipient_type == RecipientType.primary
    assert email_tracking.email_status == EmailStatus.pending


def test_email_tracking_find_all(db_session):
    """Test finding all email tracking records with filters"""
    mma = MajorMineApplicationFactory()

    # Create multiple tracking records
    email1 = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        email_status=EmailStatus.sent
    )
    email2 = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        email_status=EmailStatus.pending
    )
    email3 = EmailTrackingFactory(
        reference_table='project_summary',
        email_status=EmailStatus.completed
    )

    # Test finding all records
    result = EmailTracking.find_all()
    assert result['total'] >= 3

    # Test filtering by reference_id
    result = EmailTracking.find_all(reference_id=mma.major_mine_application_guid)
    assert result['total'] == 2

    # Test filtering by reference_table
    result = EmailTracking.find_all(reference_table='major_mine_application')
    assert result['total'] == 2

    # Test filtering by email_status
    result = EmailTracking.find_all(email_status=EmailStatus.sent)
    assert result['total'] >= 1


def test_email_tracking_find_latest_by_reference(db_session):
    """Test finding the latest email tracking record for a specific entity"""
    mma = MajorMineApplicationFactory()

    # Create multiple records for the same reference
    email1 = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        reference_email_type='mma_submit_email'
    )

    # Create a newer record
    email2 = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        reference_email_type='mma_submit_email'
    )

    latest = EmailTracking.find_latest_by_reference(
        reference_id=mma.major_mine_application_guid,
        reference_table='major_mine_application',
        email_reference_type='mma_submit_email'
    )

    assert latest is not None
    assert latest.email_tracking_id == email2.email_tracking_id


def test_email_tracking_find_by_ches_message_id(db_session):
    """Test finding email tracking record by CHES message ID"""
    ches_message_id = uuid.uuid4()
    email_tracking = EmailTrackingFactory(ches_message_id=ches_message_id)

    found = EmailTracking.find_by_ches_message_id(ches_message_id)

    assert found is not None
    assert found.email_tracking_id == email_tracking.email_tracking_id
    assert found.ches_message_id == ches_message_id


def test_email_tracking_update_status(db_session):
    """Test updating email status"""
    email_tracking = EmailTrackingFactory()

    email_tracking.update_status(
        status=EmailStatus.sent,
        timestamp_field='sent_timestamp',
        error_message=None,
        error_code=None
    )

    assert email_tracking.email_status == EmailStatus.sent
    assert email_tracking.sent_timestamp is not None


def test_email_tracking_mark_as_sent(db_session):
    """Test marking email as sent"""
    email_tracking = EmailTrackingFactory()
    ches_message_id = uuid.uuid4()
    ches_transaction_id = uuid.uuid4()

    email_tracking.mark_as_sent(
        ches_message_id=ches_message_id,
        ches_transaction_id=ches_transaction_id
    )

    assert email_tracking.email_status == EmailStatus.sent
    assert email_tracking.sent_timestamp is not None
    assert email_tracking.ches_message_id == ches_message_id
    assert email_tracking.ches_transaction_id == ches_transaction_id


def test_email_tracking_mark_as_delivered(db_session):
    """Test marking email as delivered"""
    email_tracking = EmailTrackingFactory(sent=True)

    email_tracking.mark_as_delivered()

    assert email_tracking.email_status == EmailStatus.delivered
    assert email_tracking.delivered_timestamp is not None


def test_email_tracking_mark_as_failed(db_session):
    """Test marking email as failed"""
    email_tracking = EmailTrackingFactory()
    error_message = 'Delivery failed'

    email_tracking.mark_as_failed(error_message=error_message)

    assert email_tracking.email_status == EmailStatus.failed
    assert email_tracking.failed_timestamp is not None
    assert email_tracking.error_message == error_message
    assert email_tracking.retry_count == 1

def test_email_tracking_update(db_session):
    """Test updating email tracking record with kwargs"""
    email_tracking = EmailTrackingFactory()

    email_tracking.update(
        email_status=EmailStatus.delivered,
        recipient_name='Updated Name',
        retry_count=2
    )

    assert email_tracking.email_status == EmailStatus.delivered
    assert email_tracking.recipient_name == 'Updated Name'
    assert email_tracking.retry_count == 2

def test_email_tracking_check_email_sent_within_timeframe(db_session):
    """Test checking if email was sent within timeframe"""
    # Create an email that was sent 12 hours ago
    past_time = datetime.now(utc) - timedelta(hours=12)
    email_tracking = EmailTrackingFactory(
        sent=True,
        sent_timestamp=past_time
    )

    # Should be within 24 hour timeframe
    assert email_tracking.check_email_sent_within_timeframe(24) == True

    # Should not be within 6 hour timeframe
    assert email_tracking.check_email_sent_within_timeframe(6) == False


def test_email_tracking_check_email_sent_within_timeframe_no_sent_timestamp(db_session):
    """Test checking timeframe when no sent timestamp exists"""
    email_tracking = EmailTrackingFactory(email_status=EmailStatus.pending)

    # Should handle None sent_timestamp gracefully
    with pytest.raises(TypeError):
        email_tracking.check_email_sent_within_timeframe(24)


def test_email_tracking_different_recipient_types(db_session):
    """Test creating email tracking records with different recipient types"""
    mma = MajorMineApplicationFactory()

    primary = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        recipient_type=RecipientType.primary
    )
    cc = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        recipient_type=RecipientType.cc
    )
    bcc = EmailTrackingFactory(
        reference_id=mma.major_mine_application_guid,
        recipient_type=RecipientType.bcc
    )

    assert primary.recipient_type == RecipientType.primary
    assert cc.recipient_type == RecipientType.cc
    assert bcc.recipient_type == RecipientType.bcc

def test_email_tracking_with_project_summary_reference(db_session):
    """Test email tracking with project summary reference"""
    project_summary = ProjectSummaryFactory()

    email_tracking = EmailTrackingFactory(
        reference_id=project_summary.project_summary_guid,
        reference_table='project_summary',
        reference_email_type='status_update'
    )

    assert email_tracking.reference_id == project_summary.project_summary_guid
    assert email_tracking.reference_table == 'project_summary'
    assert email_tracking.reference_email_type == 'status_update'