import os

import requests
import json

from enum import Enum
from flask import current_app

from app.tasks.celery import celery

from app.config import Config
from app.api.constants import CORE_PURPLE_LOGO_BASE64_ENCODED, MINESPACE_LOGO_BASE64_ENCODED, BC_GOV_LOGO_BASE64_ENCODED
from app.api.email_tracking.models.email_tracking import EmailTracking, EmailStatus, RecipientType
from werkzeug.exceptions import BadRequest


class EmailBodyType(Enum):
    HTML = 'html'
    TEXT = 'text'


class EmailEncoding(Enum):
    BASE64 = 'base64'
    BINARY = 'binary'
    HEX = 'hex'
    UTF8 = 'utf-8'


class EmailPriority(Enum):
    LOW = 'low'
    NORMAL = 'normal'
    HIGH = 'high'


MDS_NO_REPLY_SIGNATURE = f'''
<div>
    <hr />
    <p>This is a no-reply email address. If you need to contact the MDS team, please email us at: <a href="mailto: {Config.MDS_EMAIL}">{Config.MDS_EMAIL}</a>.</p>
    <br />
    <img src="{CORE_PURPLE_LOGO_BASE64_ENCODED}" width="320" height="106" alt="CoreLogo">
</div>
'''

MINESPACE_NO_REPLY_SIGNATURE = f'''
<div>
    <hr />
    <p>This is a no-reply email address. If you need to contact the MDS team, please email us at: <a href="mailto: {Config.MDS_EMAIL}">{Config.MDS_EMAIL}</a>.</p>
    <br />
    <img src="{MINESPACE_LOGO_BASE64_ENCODED}" width="410" height="53" alt="MinespaceLogo">
</div>
'''


# NOTE: Manage our Common Services application access here: https://getok.nrs.gov.bc.ca/app/apps/MDS
# NOTE: See here for details: https://ches.nrs.gov.bc.ca/api/v1/docs
class EmailService():
    '''Service wrapper for the Common Services "Common Hosted Email Service" (CHES) email service.'''

    # NOTE: See here for details: https://ches.nrs.gov.bc.ca/api/v1/docs#section/Authentication
    @classmethod
    def get_auth_token(cls):
        '''Gets an auth token required for all requests.'''

        url = Config.COMMON_SERVICES_AUTH_HOST
        data = {'grant_type': 'client_credentials'}
        auth = (Config.COMMON_SERVICES_CLIENT_ID, Config.COMMON_SERVICES_CLIENT_SECRET)
        resp = requests.post(url, data, auth=auth)
        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.ok:
            message = f'Common Services authentication request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("error")}\nDescription: {resp_data.get("error_description")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return

        auth_token = resp_data.get('access_token')
        if not auth_token:
            message = 'Common Services authentication request did not return an access token!'
            current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return

        return auth_token

    # NOTE: See here for details: https://ches.nrs.gov.bc.ca/api/v1/docs#tag/Health
    @classmethod
    def perform_health_check(cls):
        '''Performs a health-check and logs any necessary warnings.'''

        url = f'{Config.COMMON_SERVICES_EMAIL_HOST}/health'
        auth_token = EmailService.get_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}'}
        resp = requests.get(url, headers=headers)
        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.ok:
            message = f'Common Services health-check request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("title")}\nDescription: {resp_data.get("detail")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return

        dependencies = resp_data.get('dependencies', [])
        for dependency in dependencies:
            healthy = dependency.get('healthy')
            if not healthy:
                name = dependency.get('name')
                info = dependency.get('info')
                message = f'Common Services dependency "{name}" is not healthy and requests may be unsuccessful.\nInfo: {info}'
                current_app.logger.warning(message)

    @classmethod
    def get_ches_email_status(cls, ches_message_id):
        """
        Get email status from CHES API for a given message ID.

        Args:
            ches_message_id: UUID string of the CHES message to check

        Returns:
            dict: Status response with status, ches_status, email_status, and message
        """
        try:
            # Get auth token for CHES API
            auth_token = cls.get_auth_token()
            if not auth_token:
                current_app.logger.error("Failed to get CHES auth token")
                return {"status": "error", "message": "Failed to authenticate with CHES"}

            # Call CHES status endpoint
            url = f'{Config.COMMON_SERVICES_EMAIL_HOST}/status/{ches_message_id}'
            headers = {'Authorization': f'Bearer {auth_token}'}

            current_app.logger.info(f"Polling CHES status for message: {ches_message_id}")
            resp = requests.get(url, headers=headers)

            if resp.status_code == 404:
                current_app.logger.warning(f"CHES message not found: {ches_message_id}")
                return {"status": "not_found", "message": "Message not found in CHES"}

            if resp.status_code != 200:
                current_app.logger.error(f"CHES status request failed with status {resp.status_code}")
                return {"status": "error", "message": f"CHES API returned status {resp.status_code}"}

            try:
                ches_data = resp.json()
            except ValueError as e:
                current_app.logger.error(f"Failed to parse CHES response JSON: {e}")
                return {"status": "error", "message": "Invalid JSON response from CHES"}

            # Map CHES status to our EmailStatus
            ches_status = ches_data.get('status')
            smtpResponse = ches_data.get('smtpResponse')
            smptResponseMessage = smtpResponse.get('response') if smtpResponse else None

            status_mapping = {
                'accepted': EmailStatus.accepted,
                'pending': EmailStatus.pending,
                'completed': EmailStatus.completed,
                'failed': EmailStatus.failed,
                'cancelled': EmailStatus.cancelled
            }

            if ches_status not in status_mapping:
                current_app.logger.warning(f"Unknown CHES status: {ches_status}")
                return {"status": "unknown_status", "message": f"Unknown CHES status: {ches_status}"}

            email_status = status_mapping[ches_status]
            updated_timestamp = ches_data.get('updatedTS')

            return {
                "updated_timestamp": updated_timestamp,
                "status": "success",
                "ches_status": ches_status,
                "email_status": email_status,
                "ches_data": ches_data,
                "message": smptResponseMessage if smptResponseMessage else f"Status retrieved: {ches_status}"
            }

        except Exception as exc:
            current_app.logger.error(f"Error getting CHES status for {ches_message_id}: {str(exc)}")
            return {"status": "error", "message": str(exc)}

    @classmethod
    def _handle_successful_email_response(cls, resp_data, tracking_records):
        """
        Helper method to handle successful email responses from CHES.
        Updates tracking records and schedules status polling tasks.
        """

        # Extract messages array from CHES response
        messages = resp_data.get('messages', [])

        if messages:
            # CHES returns one message object per email send
            message = messages[0]
            ches_message_id = message.get('msgId')
            ches_transaction_id = resp_data.get('txId')

            # Update all tracking records with the same CHES IDs
            for tracking_record in tracking_records:
                tracking_record.mark_as_sent(
                    ches_message_id=ches_message_id,
                    ches_transaction_id=ches_transaction_id
                )

            if ches_message_id:
                # Schedule a status polling task in 1 minute
                try:
                    celery.send_task('app.api.email_tracking.email_status_tasks.poll_ches_email_status',
                                     args=[ches_message_id],
                                     countdown=60)
                except Exception as e:
                    current_app.logger.error(f"Failed to schedule status polling task: {str(e)}")

    @classmethod
    def _create_tracking_records_for_recipients(cls, recipients, recipient_type, tracking_record_kwargs):
        """
        Helper method to create tracking records for a list of recipients of a specific type.

        Args:
            recipients: List of recipient email addresses
            recipient_type: RecipientType enum value (primary, cc, bcc)
            tracking_record_kwargs: Dictionary of common tracking record parameters

        Returns:
            List of created EmailTracking records
        """
        tracking_records = []
        for recipient_email in recipients:
            tracking_record = EmailTracking.create(
                recipient_email=recipient_email,
                recipient_type=recipient_type,
                **tracking_record_kwargs
            )
            tracking_records.append(tracking_record)
        return tracking_records

    # NOTE: See here for details: https://ches.nrs.gov.bc.ca/api/v1/docs#tag/Email
    @classmethod
    def send_email(cls,
                   subject,
                   recipients,
                   body,
                   sender=Config.MDS_NO_REPLY_EMAIL,
                   body_type=EmailBodyType.HTML.value,
                   attachments=[],
                   bcc=[],
                   cc=[],
                   delay=0,
                   encoding=EmailEncoding.UTF8.value,
                   priority=EmailPriority.NORMAL.value,
                   tag=None,
                   send_to_proponent=False,
                   # Email tracking parameters
                   reference_id=None,
                   reference_table=None,
                   reference_email_type=None):
        '''Sends an email.'''

        # Validate enum parameters.
        if not body_type in EmailBodyType._value2member_map_:
            raise Exception('Email body type is invalid')
        if not encoding in EmailEncoding._value2member_map_:
            raise Exception('Email encoding is invalid')
        if not priority in EmailPriority._value2member_map_:
            raise Exception('Email priority is invalid')

        # NOTE: Be careful when enabling emails in local/dev/test. You could possibly be sending spam emails!
        is_not_prod = Config.ENVIRONMENT_NAME != 'prod'
        if not Config.EMAIL_ENABLED:
            current_app.logger.info('Not sending email: Emails are disabled.')
            return
        elif is_not_prod and not Config.EMAIL_RECIPIENT_OVERRIDE:
            current_app.logger.info(
                'Not sending email: Recipient override must be set when not in prod environment!')
            return

        original_recipients = recipients

        if Config.EMAIL_RECIPIENT_OVERRIDE:
            recipients = [Config.EMAIL_RECIPIENT_OVERRIDE]

        # Create email tracking records before sending
        tracking_records = []

        tracking_record_kwargs = {
            'reference_id': reference_id,
            'reference_table': reference_table,
            'email_template_name': None,
            'reference_email_type': reference_email_type,
            'email_subject': subject,
        }

        # Create tracking records for all recipient types
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            original_recipients, RecipientType.primary, tracking_record_kwargs))
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            cc, RecipientType.cc, tracking_record_kwargs))
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            bcc, RecipientType.bcc, tracking_record_kwargs))


        EmailService.perform_health_check()

        # If the receiver is the proponent, add the MINESPACE no-reply signature.
        # if sender is the MDS no-reply email address, add the MDS no-reply signature to the email body.
        if send_to_proponent:
            body += MINESPACE_NO_REPLY_SIGNATURE
        elif sender == Config.MDS_NO_REPLY_EMAIL:
            body += MDS_NO_REPLY_SIGNATURE

        url = f'{Config.COMMON_SERVICES_EMAIL_HOST}/email'
        auth_token = EmailService.get_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}', 'Content-Type': 'application/json'}
        data = {
            'subject': f'{subject} [recipients: {original_recipients}]' if is_not_prod else subject,
            'from': sender,
            'to': recipients,
            'body': body,
            'bodyType': body_type,
            'attachments': attachments,
            'bcc': bcc,
            'cc': cc,
            'delayTS': delay,
            'encoding': encoding,
            'priority': priority,
            'tag': tag
        }
        resp = requests.post(url, json.dumps(data), headers=headers)
        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.created:
            message = f'Common Services email request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("title")}\nDescription: {resp_data.get("detail")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)

            # Update tracking records with failure status
            error_message = resp_data.get('detail', 'Email send failed') if resp_data else 'Email send failed'
            for tracking_record in tracking_records:
                tracking_record.mark_as_failed(error_message=error_message)
            return


        # Update tracking records with sent status
        cls._handle_successful_email_response(resp_data, tracking_records)

        current_app.logger.info(
            f'Common Services email request successful.\nEmail Subject: {subject}\nResponse: {resp_data}\nRecipients: {original_recipients}'
        )

    # NOTE: See here for details: https://ches.nrs.gov.bc.ca/api/v1/docs#tag/Email
    @classmethod
    def send_template_email(cls,
                            subject,
                            recipients,
                            template_path,
                            context,
                            sender=Config.MDS_NO_REPLY_EMAIL,
                            body_type=EmailBodyType.HTML.value,
                            attachments=[],
                            bcc=[],
                            cc=[],
                            delay=0,
                            encoding=EmailEncoding.UTF8.value,
                            priority=EmailPriority.NORMAL.value,
                            tag=None,
                            # Email tracking parameters
                            reference_id=None,
                            reference_table=None,
                            reference_email_type=None):
        '''Sends an email using Jinja2 template rendering.

        Args:
            template_path: Path to a Jinja2 template (e.g., "email/report_error/core_error_report_email.html")
            context: Dictionary of variables to pass to the template
        '''

        # Validate enum parameters.
        if not body_type in EmailBodyType._value2member_map_:
            raise Exception('Email body type is invalid')
        if not encoding in EmailEncoding._value2member_map_:
            raise Exception('Email encoding is invalid')
        if not priority in EmailPriority._value2member_map_:
            raise Exception('Email priority is invalid')

        # NOTE: Be careful when enabling emails in local/dev/test. You could possibly be sending spam emails!
        is_not_prod = Config.ENVIRONMENT_NAME != 'prod'
        if not Config.EMAIL_ENABLED:
            current_app.logger.info('Not sending email: Emails are disabled.')
            return
        elif is_not_prod and not Config.EMAIL_RECIPIENT_OVERRIDE:
            current_app.logger.info(
                'Not sending email: Recipient override must be set when not in prod environment!')
            return

        original_recipients = recipients

        if Config.EMAIL_RECIPIENT_OVERRIDE:
            recipients = [Config.EMAIL_RECIPIENT_OVERRIDE]

        try:
            # Render template with Jinja2
            template = current_app.jinja_env.get_template(template_path)
            file_name = os.path.basename(template_path)
            email_template_name = os.path.splitext(file_name)[0]

            # Add logos to context for template rendering
            template_context = context.copy()
            template_context['bc_gov_logo'] = BC_GOV_LOGO_BASE64_ENCODED
            template_context['core_logo'] = CORE_PURPLE_LOGO_BASE64_ENCODED
            template_context['minespace_logo'] = MINESPACE_LOGO_BASE64_ENCODED

            rendered_body = template.render(**template_context)

        except Exception as e:
            current_app.logger.error(f"Error rendering template {template_path}: {e}")
            raise Exception(f"Template rendering failed: {e}")

        # Create email tracking records before sending
        tracking_records = []

        tracking_record_kwargs = {
            'reference_id': reference_id,
            'reference_table': reference_table,
            'email_template_name': email_template_name,
            'reference_email_type': reference_email_type if reference_email_type else email_template_name,
            'email_subject': subject,
        }

        # Create tracking records for all recipient types
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            original_recipients, RecipientType.primary, tracking_record_kwargs))
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            cc, RecipientType.cc, tracking_record_kwargs))
        tracking_records.extend(cls._create_tracking_records_for_recipients(
            bcc, RecipientType.bcc, tracking_record_kwargs))

        EmailService.perform_health_check()

        url = f'{Config.COMMON_SERVICES_EMAIL_HOST}/email'
        auth_token = EmailService.get_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}', 'Content-Type': 'application/json'}
        data = {
            'subject': f'{subject} [recipients: {original_recipients}]' if is_not_prod else subject,
            'from': sender,
            'to': recipients,
            'body': rendered_body,
            'bodyType': body_type,
            'attachments': attachments,
            'bcc': bcc,
            'cc': cc,
            'delayTS': delay,
            'encoding': encoding,
            'priority': priority,
            'tag': tag
        }
        resp = requests.post(url, json.dumps(data), headers=headers)
        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.created:
            message = f'Common Services email request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("title")}\nDescription: {resp_data.get("detail")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)

            # Update tracking records with failure status
            error_code = str(resp.status_code)
            error_message = resp_data.get('detail', 'Template email send failed') if resp_data else 'Template email send failed'

            for tracking_record in tracking_records:
                tracking_record.mark_as_failed(error_message=error_message, error_code=error_code)
            return


        # Update tracking records with sent status if applicable
        cls._handle_successful_email_response(resp_data, tracking_records)

        current_app.logger.info(
            f'Common Services email request successful.\nEmail Subject: {subject}\nResponse: {resp_data}\nRecipients: {original_recipients}'
        )
