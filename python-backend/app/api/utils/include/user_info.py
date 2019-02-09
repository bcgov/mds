from app.extensions import jwt
from jose import jwt as jwt_jose

VALID_REALM = [
    'idir'
]


class User:
    def get_user_raw_info(self):
        token = jwt.get_token_auth_header()
        jwks = jwt.get_jwks()
        unverified_header = jwt_jose.get_unverified_header(token)
        rsa_key = jwt.get_rsa_key(jwks, unverified_header["kid"])
        return jwt_jose.decode(
            token,
            rsa_key,
            algorithms=jwt.algorithms,
            audience=jwt.audience,
            issuer=jwt.issuer
        )

    def get_user_email(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('email')

    def get_user_given_name(self):
        raw_info = self.get_user_raw_info()
        return raw_info.get('given_name')

    def get_user_username(self):
        raw_info = self.get_user_raw_info()
        realms = list(set(VALID_REALM) & set(raw_info['realm_access']['roles']))
        return realms[0] + '\\' + raw_info.get('preferred_username')
