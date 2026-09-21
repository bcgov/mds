import requests
from flask import current_app
from app.config import Config
from app.extensions import cache
from app.api.constants import CSS_AUTH_TOKEN


class CSSService():
    '''Service wrapper for CSS Keycloak Gold SSO

    API documentation: https://api.loginproxy.gov.bc.ca/openapi/swagger#/
    Manage: https://bcgov.github.io/sso-requests/
    
    '''

    @staticmethod
    def get_css_auth_token():
        '''Gets access token required for all requests'''

        auth_token = cache.get(CSS_AUTH_TOKEN)
        if auth_token is not None:
            return auth_token

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

        timeout = resp_data.get('expires_in') - 10 # should be 300
        cache.set(CSS_AUTH_TOKEN, auth_token, timeout=timeout)
        return auth_token

    @staticmethod
    def get_recipients_by_rolename(rolename):
        '''Get a list of emails belonging to all kc users with given rolename in core

        :param rolename: The keycloak role name (str)
        :return: list
        '''
        
        url = f'{Config.CSS_API_URL}/{Config.CSS_ENV}/roles/{rolename}/users'
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

        users = resp_data.get('data') 
        user_emails = [user['email'] for user in users]

        return user_emails

    @staticmethod
    def get_roles_by_user(username: str):
        '''Get a list of roles assigned to a user

        :param username: The keycloak username
        :return: list of role names
        '''
        
        url = f'{Config.CSS_API_URL}/{Config.CSS_ENV}/users/{username}/roles'
        auth_token = CSSService.get_css_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}'}

        resp = requests.get(url, headers=headers)

        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        if resp.status_code != requests.codes.ok:
            message = f'CSS get user roles request returned {resp.status_code}.'
            if resp_data:
                message += f'\nMessage: {resp_data.get("message")}'
                current_app.logger.debug(resp_data)
            current_app.logger.error(message)
            return []

        roles_data = resp_data.get('data', [])
        role_names = [role['name'] for role in roles_data]
        return role_names

    @staticmethod
    def delete_user_role_mapping(username: str, role_name: str):
        '''Remove a role from a user

        :param username: The keycloak username
        :param role_name: The role name to remove
        :return: bool indicating success
        '''
        
        url = f'{Config.CSS_API_URL}/{Config.CSS_ENV}/users/{username}/roles/{role_name}'
        auth_token = CSSService.get_css_auth_token()
        headers = {'Authorization': f'Bearer {auth_token}'}

        resp = requests.delete(url, headers=headers)

        # 204 No Content is success
        if resp.status_code == requests.codes.no_content:
            return True

        # Any other status is an error
        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        message = f'CSS delete user role request returned {resp.status_code}.'
        if resp_data:
            message += f'\nMessage: {resp_data.get("message")}'
            current_app.logger.debug(resp_data)
        else:
            current_app.logger.error(f'CSS API Response text: {resp.text}')
        current_app.logger.error(message)
        return False

    @staticmethod
    def assign_roles_to_user(username: str, roles: list[str]):
        '''Assign keycloak roles to a user

        :param username: The keycloak username
        :param roles: List of role names to assign
        :return: bool indicating success
        '''
        
        url = f'{Config.CSS_API_URL}/{Config.CSS_ENV}/users/{username}/roles'
        auth_token = CSSService.get_css_auth_token()
        headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }
        data = [{'name': role} for role in roles]

        resp = requests.post(url, json=data, headers=headers)

        try:
            resp_data = resp.json()
        except ValueError:
            resp_data = None

        # 200 OK or 201 Created are both success codes
        if resp.status_code not in [requests.codes.ok, requests.codes.created]:
            message = f'CSS assign roles request returned {resp.status_code}.'
            if resp_data:
                current_app.logger.error(f'CSS API Response: {resp_data}')
                message += f'\nError: {resp_data.get("error")}\nDescription: {resp_data.get("error_description")}'
            else:
                current_app.logger.error(f'CSS API Response text: {resp.text}')
            current_app.logger.error(message)
            return False

        return True