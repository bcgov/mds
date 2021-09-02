import requests, json

from enum import Enum
from flask import current_app

from app.config import Config
from app.api.constants import CORE_PURPLE_LOGO_BASE64_ENCODED


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
    <img src="{CORE_PURPLE_LOGO_BASE64_ENCODED}" width="320" height="106" alt="Core Logo">
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
                   tag=None):
        '''Sends an email.'''

        # Validate enum parameters.
        if not body_type in EmailBodyType._value2member_map_:
            raise Exception('Email body type is invalid')
        if not encoding in EmailEncoding._value2member_map_:
            raise Exception('Email encoding is invalid')
        if not priority in EmailPriority._value2member_map_:
            raise Exception('Email priority is invalid')

        # NOTE: Be careful when enabling emails in local/dev/test. You could possibly be sending spam emails!
        if Config.ENVIRONMENT_NAME != 'prod':
            current_app.logger.info('Not sending email: Emails can only be sent in Production.')
            return

        EmailService.perform_health_check()

        # If the sender is the MDS no-reply email address, add the MDS no-reply signature to the email body.
        if sender == Config.MDS_NO_REPLY_EMAIL:
            body += MDS_NO_REPLY_SIGNATURE

        url = f'{Config.COMMON_SERVICES_EMAIL_HOST}/email'
        auth_token = EmailService.get_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}', 'Content-Type': 'application/json'}
        data = {
            'subject': subject,
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
            return

        current_app.logger.debug(
            f'Common Services email request successful.\nEmail Subject: {subject}\nResponse: {resp_data}'
        )
