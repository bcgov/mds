from datetime import datetime, timezone
from flask import current_app
from celery import Task

from app.api.email_tracking.models.email_tracking import EmailTracking, EmailStatus
from app.api.services.email_service import EmailService
from app.api.tasks.celery_task_base import TaskBase
from app.tasks.celery import celery


@celery.task(base=TaskBase, bind=True, max_retries=5, default_retry_delay=300)
def poll_ches_email_status(self, ches_message_id):
    """
    Poll CHES API for email status and update tracking record.

    Args:
        ches_message_id: UUID string of the CHES message to check

    Returns:
        dict: Status update result
    """
    try:
        # Find the email tracking record
        tracking_record = EmailTracking.find_by_ches_message_id(ches_message_id)
        if not tracking_record:
            current_app.logger.error(f"No email tracking record found for CHES message ID: {ches_message_id}")
            return {"status": "error", "message": "Tracking record not found"}

        # Skip if email is already in a final state
        if tracking_record.email_status in [EmailStatus.completed, EmailStatus.failed, EmailStatus.cancelled]:
            current_app.logger.info(f"Email {ches_message_id} already in final state: {tracking_record.email_status}")
            return {"status": "complete", "message": f"Email already in final state: {tracking_record.email_status}"}

        # Get status from CHES via EmailService
        status_result = EmailService.get_ches_email_status(ches_message_id)

        if status_result["status"] == "not_found":
            # Don't retry for 404s, but don't mark as failed either
            return status_result

        if status_result["status"] == "unknown_status":
            # Don't update for unknown statuses
            return status_result

        if status_result["status"] == "error":
            current_app.logger.error(f"Error polling CHES status for {ches_message_id}: {status_result['message']}")
            # Will be handled by the exception block for retries
            raise Exception(status_result["message"])

        # Extract status information
        ches_status = status_result["ches_status"]
        new_status = status_result["email_status"]
        ches_data = status_result["ches_data"]
        updated_timestamp = status_result["updated_timestamp"]
        if isinstance(updated_timestamp, int):
            updated_timestamp = datetime.fromtimestamp(updated_timestamp / 1000, timezone.utc)

        # Update tracking record if status has changed
        if tracking_record.email_status != new_status:
            current_app.logger.info(f"Updating email {ches_message_id} status from {tracking_record.email_status} to {new_status}")

            # Update status with appropriate timestamp
            if new_status == EmailStatus.completed:
                tracking_record.mark_as_delivered(updated_timestamp)
            elif new_status == EmailStatus.failed:
                # Extract error information from CHES response
                smtp_response = ches_data.get('smtpResponse', {})
                error_message = smtp_response.get('response', 'Email delivery failed')
                tracking_record.mark_as_failed(error_message=error_message, increment_retry=False)
            else:
                # For accepted, pending, cancelled statuses
                timestamp_field = None
                if new_status == EmailStatus.accepted:
                    # CHES accepted the message
                    timestamp_field = 'sent_timestamp'

                tracking_record.update_status(new_status, timestamp_field=timestamp_field)

        # Schedule next poll if email is not in final state
        if new_status in [EmailStatus.pending, EmailStatus.accepted, EmailStatus.sent]:
            # Schedule next poll in 5 minutes
            current_app.logger.info(f"Scheduling next poll for email {ches_message_id} in 5 minutes")
            poll_ches_email_status.retry(args=[ches_message_id], countdown=300)
        else:
            current_app.logger.info(f"Email {ches_message_id} reached final status: {new_status}")

        return {
            "status": "success",
            "message": f"Status updated to {new_status}",
            "ches_status": ches_status,
            "email_status": new_status.value
        }

    except Exception as exc:
        current_app.logger.error(f"Error polling CHES status for {ches_message_id}: {str(exc)}")

        # Retry connecting to CHES with exponential backoff
        retry_count = self.request.retries
        if retry_count < self.max_retries:
            # Exponential backoff: 5min, 10min, 20min, 40min, 80min
            retry_delay = 300 * (2 ** retry_count)
            current_app.logger.info(f"Retrying CHES status poll for {ches_message_id} in {retry_delay} seconds (attempt {retry_count + 1}/{self.max_retries})")
            raise self.retry(countdown=retry_delay, exc=exc)
        else:
            # (the email might have been delivered, we just can't verify it)
            current_app.logger.error(f"Max retries reached for CHES status polling: {ches_message_id}")
            return {"status": "error", "message": f"Max retries reached: {str(exc)}"}

@celery.task(base=TaskBase, bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, subject, recipients, body, sender=None, cc=None, bcc=None, distribution_list_guid=None, **kwargs):
    """
    Celery task to send a standard email asynchronously.
    """
    try:
        if sender is None:
            from app.config import Config
            sender = Config.MDS_NO_REPLY_EMAIL
        
        EmailService.send_email(
            subject=subject,
            recipients=recipients,
            body=body,
            sender=sender,
            cc=cc,
            bcc=bcc,
            **kwargs
        )
        return {"status": "success"}
    except Exception as exc:
        current_app.logger.error(f"Error sending email async: {str(exc)}")
        raise self.retry(exc=exc)

@celery.task(base=TaskBase, bind=True, max_retries=3, default_retry_delay=60)
def send_template_email_task(self, subject, recipients, template_path, context, sender=None, cc=None, bcc=None, distribution_list_guid=None, **kwargs):
    """
    Celery task to send a template email asynchronously.
    """
    try:
        if sender is None:
            from app.config import Config
            sender = Config.MDS_NO_REPLY_EMAIL
            
        EmailService.send_template_email(
            subject=subject,
            recipients=recipients,
            template_path=template_path,
            context=context,
            sender=sender,
            cc=cc,
            bcc=bcc,
            **kwargs
        )
        return {"status": "success"}
    except Exception as exc:
        current_app.logger.error(f"Error sending template email async: {str(exc)}")
        raise self.retry(exc=exc)