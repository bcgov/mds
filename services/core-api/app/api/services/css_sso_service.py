import requests
from flask import current_app
from app.config import Config


class CSSService():
    '''Service wrapper for CSS Keycloak Gold SSO

    API documentation: https://api.loginproxy.gov.bc.ca/openapi/swagger#/
    Manage: https://bcgov.github.io/sso-requests/
    
    '''

    @staticmethod
    def get_css_auth_token():
        '''Gets access token required for all requests'''

        url = Config.CSS_TOKEN_URL
        data = {'grant_type': 'client_credentials'}
        auth = (Config.CSS_CLIENT_ID, Config.CSS_CLIENT_SECRET)
        resp = requests.post(url, data=data, auth=auth)

        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.ok:
            message = f'CSS authentication request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("error")}\nDescription: {resp_data.get("error_description")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return

        auth_token = resp_data.get('access_token')
        if not auth_token:
            message = 'CSS authentication request did not return an access token!'
            current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return
        return auth_token

    @staticmethod
    def get_recipients_by_rolename(rolename):
        '''Get a list of emails belonging to all kc users with given rolename in core

        :param rolename: The keycloak role name (str)
        :return: list
        '''
        
        url = f'{Config.CSS_API_URL}/{Config.CSS_ENV}/user-role-mappings?roleName={rolename}'
        auth_token = CSSService.get_css_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}'}

        resp = requests.get(url, headers=headers)

        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.ok:
            message = f'CSS role names request returned {resp.status_code}.'
            if resp_data:
                message += f'\nError: {resp_data.get("error")}\nDescription: {resp_data.get("error_description")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return            

        users = resp_data.get('users') 
        user_emails = [user['email'] for user in users]

        return user_emails