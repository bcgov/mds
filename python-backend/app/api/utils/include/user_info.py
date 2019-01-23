from app.extensions import jwt
from jose import jwt as jwt_jose

VALID_REALM = [
    'idir'
]


class User:
    def get_user_raw_info(self):
        token = jwt.get_token_auth_header()
        return jwt_jose.get_unverified_claims(token)      

    def get_user_email(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('email')

    def get_user_given_name(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('given_name')

    def get_user_username(self):
        raw_info = self.get_user_raw_info()
        realms = list(set(VALID_REALM) & set(raw_info['realm_access']['roles']))
        return realms[0] + '\\' + raw_info['preferred_username'] if realms else raw_info['preferred_username']
