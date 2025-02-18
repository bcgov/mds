import base64
import hashlib
import os
import secrets
import socket
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

import click
import requests


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    code = None
    
    def do_GET(self):
        # Extract code from query parameters
        query_components = parse_qs(urlparse(self.path).query)
        OAuthCallbackHandler.code = query_components.get('code', [None])[0]
        
        # Send success response to browser
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Authentication successful! You can close this window.")
        
        # Stop the server
        def shutdown():
            self.server.shutdown()
        self.server.timeout = 1
        from threading import Timer
        Timer(0.5, shutdown).start()

def get_free_port():
    sock = socket.socket()
    sock.bind(('', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port

def generate_code_verifier():
    code_verifier = secrets.token_urlsafe(96)[:128]
    return code_verifier

def generate_code_challenge(code_verifier):
    code_challenge = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    code_challenge = base64.urlsafe_b64encode(code_challenge).decode('utf-8')
    code_challenge = code_challenge.replace('=', '')  # Remove padding
    return code_challenge

def get_auth_token(config):
    """
    Perform OIDC authentication flow and return access token
    """
    # Setup local server for callback
    callback_port = 3020
    redirect_uri = f'http://localhost:{callback_port}'
    
    # Generate PKCE values
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)
    
    # Construct authorization URL
    auth_url = config['JWT_OIDC_WELL_KNOWN_CONFIG'].replace('.well-known/openid-configuration', 'protocol/openid-connect/auth')
    auth_params = {
        'client_id': config['JWT_OIDC_AUDIENCE'],
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid+profile+email',  # Changed spaces to + for URL encoding
        'code_challenge': code_challenge,
        'code_challenge_method': 'S256'
    }
    
    auth_request_url = f"{auth_url}?{'&'.join(f'{k}={v}' for k, v in auth_params.items())}"
    
    # Display clickable link
    click.echo("Please click the following link to authenticate:")
    click.echo(click.style(auth_request_url, fg='blue', underline=True))
    click.echo("\nWaiting for authentication...")
    
    # Start local server to receive callback
    server = HTTPServer(('0.0.0.0', callback_port), OAuthCallbackHandler)
    server.timeout = 200
    server.handle_request()
    
    if not OAuthCallbackHandler.code:
        raise Exception("Failed to get authorization code")
    
    # Exchange code for token
    token_url = config['JWT_OIDC_WELL_KNOWN_CONFIG'].replace('.well-known/openid-configuration', 'protocol/openid-connect/token')
    token_data = {
        'grant_type': 'authorization_code',
        'code': OAuthCallbackHandler.code,
        'redirect_uri': redirect_uri,
        'client_id': config['JWT_OIDC_AUDIENCE'],
        'code_verifier': code_verifier
    }
    
    response = requests.post(token_url, data=token_data)
    if response.status_code != 200:
        raise Exception(f"Failed to get token: {response.text}")
    
    return response.json()['access_token']
