import requests
import app
from flask import current_app


def get_mines_svc_url(path):
    # inserts basepath to handle openshift deployments
    return 'http://localhost:5000' + current_app.config['BASE_PATH'] + '/mines' + path


def get_document_manager_svc_url(path=''):
    # inserts basepath to handle openshift deployments
    # DOCUMENT_MANAGER_URL secret ends with '/api', causing conflicts with also using base path,
    return current_app.config['DOCUMENT_MANAGER_URL'] + current_app.config[
        'BASE_PATH'] + '/document-manager' + path
