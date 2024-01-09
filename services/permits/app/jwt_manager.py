import base64
import json
import os

import requests
from authlib.jose import jwt
from authlib.jose.errors import BadSignatureError, ExpiredTokenError, InvalidClaimError, InvalidTokenError


def get_jwk_for_kid(jwks_uri, kid):
    keys = requests.get(jwks_uri).json()  # request for JWT Signer Keys
    keys = keys.get("keys")

    if keys is None:
        return "No keys found in jwks_uri."

    matching_jwks = [k for k in keys if k.get('kid') == kid]

    if len(matching_jwks) == 0:
        return False, "Could not find matching JWT Key ID."

    jwk = matching_jwks[0]

    return True, jwk


def add_padding(str):
    # Add padding (=) to a string until its length is a multiple of 4
    return str + '=' * (-len(str) % 4)


def validate_oidc_token(token):
    config_url = os.environ.get('JWT_OIDC_WELL_KNOWN_CONFIG')

    try:
        oidc_config = requests.get(config_url).json()
        jwks_uri = oidc_config.get('jwks_uri')

        # Remove "Bearer " from the token
        token = token.split(' ')[1]

        header, payload, signature = token.split('.')

        # Get the header data while adding padding to the string if necessary
        header_data = base64.urlsafe_b64decode(add_padding(header))
        header_data = json.loads(header_data)

        # Get the 'kid' from the header data and use it to get the JWK
        key_id = header_data.get('kid')
        result, jwk_or_error = get_jwk_for_kid(jwks_uri, key_id)

        if not result:
            return False, jwk_or_error

        jwk = jwk_or_error

    except requests.exceptions.RequestException as e:
        return False, str(e)

    try:
        audience = os.environ.get('JWT_OIDC_CLAIM_AUDIENCE')
        issuer = os.environ.get('JWT_OIDC_CLAIM_ISSUER')

        if audience is None:
            raise Exception("JWT_OIDC_CLAIM_AUDIENCE is not set.")

        if issuer is None:
            raise Exception("JWT_OIDC_CLAIM_ISSUER is not set.")

        claims = jwt.decode(
            token,
            jwk,
            claims_options={
                "iss": {"essential": True, "values": [os.environ.get('JWT_OIDC_CLAIM_ISSUER')]},
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
