import os
import json
import base64
import pytest
from unittest.mock import patch, MagicMock
from app.jwt_manager import JWTManager, validate_oidc_token, get_jwk_for_kid
import requests

# Sample mock data
MOCK_OIDC_CONFIG = {
    "jwks_uri": "https://test.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs"
}

MOCK_JWKS = {
    "keys": [
        {
            "kid": "key1",
            "kty": "RSA",
            "alg": "RS256",
            "n": "mock-modulus",
            "e": "AQAB"
        }
    ]
}

@pytest.fixture(autouse=True)
def reset_jwt_manager_cache():
    # Clear JWTManager class cache before each test
    JWTManager._oidc_config = None
    JWTManager._jwks_uri = None
    JWTManager._jwks = None


@patch("requests.get")
def test_jwt_manager_caching(mock_get):
    # Set up mocks
    mock_config_response = MagicMock()
    mock_config_response.json.return_value = MOCK_OIDC_CONFIG
    
    mock_jwks_response = MagicMock()
    mock_jwks_response.json.return_value = MOCK_JWKS
    
    # First call returns config, second returns keys
    mock_get.side_effect = [mock_config_response, mock_jwks_response]

    with patch.dict(os.environ, {"JWT_OIDC_WELL_KNOWN_CONFIG": "https://test-config"}):
        # 1. Fetch first key
        result, key = JWTManager.get_jwk_for_kid("key1")
        assert result is True
        assert key["kid"] == "key1"
        
        # requests.get should have been called twice (once for config, once for JWKs)
        assert mock_get.call_count == 2

        # 2. Fetch key again (should hit cache)
        result2, key2 = JWTManager.get_jwk_for_kid("key1")
        assert result2 is True
        assert key2["kid"] == "key1"
        
        # requests.get call count should still be 2 (verifying caching!)
        assert mock_get.call_count == 2


@patch("requests.get")
def test_jwt_manager_key_rotation(mock_get):
    # Set up mock config
    mock_config_response = MagicMock()
    mock_config_response.json.return_value = MOCK_OIDC_CONFIG
    
    # First JWKs response (does not contain key2)
    mock_jwks_response_1 = MagicMock()
    mock_jwks_response_1.json.return_value = MOCK_JWKS
    
    # Second JWKs response (contains key2 after rotation)
    rotated_jwks = {
        "keys": [
            {
                "kid": "key1",
                "kty": "RSA",
                "alg": "RS256"
            },
            {
                "kid": "key2",
                "kty": "RSA",
                "alg": "RS256"
            }
        ]
    }
    mock_jwks_response_2 = MagicMock()
    mock_jwks_response_2.json.return_value = rotated_jwks

    # side_effect order:
    # 1. Config fetch
    # 2. First JWKs fetch (returns keys: [key1])
    # 3. Second JWKs fetch (returns keys: [key1, key2] after cache clear)
    mock_get.side_effect = [mock_config_response, mock_jwks_response_1, mock_jwks_response_2]

    with patch.dict(os.environ, {"JWT_OIDC_WELL_KNOWN_CONFIG": "https://test-config"}):
        # Initial fetch of key1 (loads cache)
        result, key = JWTManager.get_jwk_for_kid("key1")
        assert result is True
        assert mock_get.call_count == 2

        # Fetch unknown kid "key2" -> should clear cache and re-fetch keys once
        result2, key2 = JWTManager.get_jwk_for_kid("key2")
        assert result2 is True
        assert key2["kid"] == "key2"
        
        # requests.get call count should now be 3 (config, initial jwks, rotated jwks)
        assert mock_get.call_count == 3


@patch("requests.get")
def test_jwt_manager_key_not_found(mock_get):
    mock_config_response = MagicMock()
    mock_config_response.json.return_value = MOCK_OIDC_CONFIG
    
    mock_jwks_response = MagicMock()
    mock_jwks_response.json.return_value = MOCK_JWKS
    
    # Side effects: config fetch, first keys fetch, second keys fetch (after rotation fails)
    mock_get.side_effect = [mock_config_response, mock_jwks_response, mock_jwks_response]

    with patch.dict(os.environ, {"JWT_OIDC_WELL_KNOWN_CONFIG": "https://test-config"}):
        result, err = JWTManager.get_jwk_for_kid("unknown_key")
        assert result is False
        assert "Could not find matching JWT Key ID" in err
        assert mock_get.call_count == 3


def test_add_padding():
    from app.jwt_manager import add_padding
    assert add_padding("abc") == "abc="
    assert add_padding("abcd") == "abcd"
    assert add_padding("ab") == "ab=="


def test_backward_compatible_helper():
    with patch.object(JWTManager, "get_jwk_for_kid") as mock_get_jwk:
        mock_get_jwk.return_value = (True, "mock-jwk")
        result, jwk = get_jwk_for_kid("uri", "kid123")
        assert result is True
        assert jwk == "mock-jwk"
        mock_get_jwk.assert_called_once_with("kid123")
