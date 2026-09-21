import base64
import json
import os

import requests
from authlib.jose import jwt
from authlib.jose.errors import (
    BadSignatureError,
    ExpiredTokenError,
    InvalidClaimError,
    InvalidTokenError,
)


class JWTManager:
    _oidc_config = None
    _jwks_uri = None
    _jwks = None

    @classmethod
    def get_oidc_config(cls):
        if cls._oidc_config is None:
            config_url = os.environ.get("JWT_OIDC_WELL_KNOWN_CONFIG")
            if not config_url:
                raise Exception("JWT_OIDC_WELL_KNOWN_CONFIG is not set.")
            cls._oidc_config = requests.get(config_url).json()
            cls._jwks_uri = cls._oidc_config.get("jwks_uri")
        return cls._oidc_config

    @classmethod
    def get_jwks_uri(cls):
        if cls._jwks_uri is None:
            cls.get_oidc_config()
        return cls._jwks_uri

    @classmethod
    def get_jwks(cls):
        if cls._jwks is None:
            jwks_uri = cls.get_jwks_uri()
            if not jwks_uri:
                raise Exception("jwks_uri is not available in OIDC config.")
            keys = requests.get(jwks_uri).json().get("keys")
            if keys is None:
                raise Exception("No keys found in jwks_uri.")
            cls._jwks = keys
        return cls._jwks

    @classmethod
    def get_jwk_for_kid(cls, kid):
        try:
            keys = cls.get_jwks()
        except Exception as e:
            return False, str(e)

        matching_jwks = [k for k in keys if k.get("kid") == kid]

        if len(matching_jwks) == 0:
            # Clear cache and retry once to support key rotation
            cls._jwks = None
            try:
                keys = cls.get_jwks()
            except Exception as e:
                return False, str(e)
            matching_jwks = [k for k in keys if k.get("kid") == kid]
            if len(matching_jwks) == 0:
                return False, "Could not find matching JWT Key ID."

        return True, matching_jwks[0]


def get_jwk_for_kid(jwks_uri, kid):
    # Maintained for backward compatibility if called elsewhere
    return JWTManager.get_jwk_for_kid(kid)


def add_padding(str):
    # Add padding (=) to a string until its length is a multiple of 4
    return str + "=" * (-len(str) % 4)


def validate_oidc_token(token):
    try:
        # Remove "Bearer " from the token
        token = token.split(" ")[1]

        header, payload, signature = token.split(".")

        # Get the header data while adding padding to the string if necessary
        header_data = base64.urlsafe_b64decode(add_padding(header))
        header_data = json.loads(header_data)

        # Get the 'kid' from the header data and use it to get the JWK
        key_id = header_data.get("kid")
        result, jwk_or_error = JWTManager.get_jwk_for_kid(key_id)

        if not result:
            return False, jwk_or_error

        jwk = jwk_or_error

    except requests.exceptions.RequestException as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)

    try:
        audience = os.environ.get("JWT_OIDC_CLAIM_AUDIENCE")
        issuer = os.environ.get("JWT_OIDC_CLAIM_ISSUER")

        if audience is None:
            raise Exception("JWT_OIDC_CLAIM_AUDIENCE is not set.")

        if issuer is None:
            raise Exception("JWT_OIDC_CLAIM_ISSUER is not set.")

        claims = jwt.decode(
            token,
            jwk,
            claims_options={
                "iss": {
                    "essential": True,
                    "values": [os.environ.get("JWT_OIDC_CLAIM_ISSUER")],
                },
                "aud": {"essential": True, "values": ["mds-core-api-internal-5194"]},
                "exp": {"essential": True},
                "iat": {"essential": True},
                "sub": {"essential": True},
            },
        )

        claims.validate()

        return True, claims
    except BadSignatureError as e:
        return False, str(e)
    except ExpiredTokenError as e:
        return False, str(e)
    except InvalidTokenError as e:
        return False, str(e)
    except InvalidClaimError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)
