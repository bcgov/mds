import requests
import app
from flask import current_app


def get_documents_svc_url(path):
    #inserts basepath to handle openshift deployments
    return current_app.config['DOCUMENT_MS_URL'] + current_app.config[
        'BASE_PATH'] + '/documents' + path
