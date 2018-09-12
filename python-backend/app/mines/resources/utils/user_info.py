from app.extensions import jwt
from jose import jwt as jwt_jose

class User:
    def get_user_raw_info(self):
        token = jwt.get_token_auth_header()
        jwks = jwt.get_jwks()
        try:
            unverified_header = jwt_jose.get_unverified_header(token)
        except jwt_jose.JWTError:
            raise AuthError({"code": "invalid_header",
                            "description":
                                "Invalid header. "
                                "Use an RS256 signed JWT Access Token"}, 401)
        if unverified_header["alg"] == "HS256":
            raise AuthError({"code": "invalid_header",
                            "description":
                                "Invalid header. "
                                "Use an RS256 signed JWT Access Token"}, 401)
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
        return raw_info['email']
    
    def get_user_given_name(self):
        raw_info = self.get_user_raw_info()
        return raw_info['given_name']

    def get_user_username(self):
        raw_info = self.get_user_raw_info()
        return raw_info['preferred_username']
