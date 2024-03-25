

class AMSApiService():
    '''Service wrapper for the AMS API Service.'''

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
