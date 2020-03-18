import requests, hashlib, os, mimetypes, json, datetime
from flask import Response, current_app, stream_with_context
from app.config import Config
from werkzeug.exceptions import NotFound, BadRequest
from flask import current_app, send_file, request

import json
import sys
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.services.document_manager_service import DocumentManagerService


def sha256_checksum(filename, block_size=65536):
    sha256 = hashlib.sha256()
    with open(filename, 'rb') as f:
        for block in iter(lambda: f.read(block_size), b''):
            sha256.update(block)
    return sha256.hexdigest()


class DocumentGeneratorService():
    document_generator_url = f'{Config.DOCUMENT_GENERATOR_URL}/template'

    @classmethod
    def generate_document_and_stream_response(cls, template_file_path, data):
        current_app.logger.debug(f'CHECKING TEMPLATE at {template_file_path}')
        template_exists = cls._check_remote_template(template_file_path)
        if not template_exists:
            current_app.logger.debug(f'PUSHING TEMPLATE at {template_file_path}')
            cls._push_template(template_file_path)

        file_sha = sha256_checksum(template_file_path)
        file_name = os.path.basename(template_file_path)
        file_name_no_ext = '.'.join(file_name.split('.')[:-1])
        # https://carbone.io/api-reference.html#native-api
        body = {
            'data': data,
            'options': {
                'outputName': f'{file_name_no_ext}-{datetime.date.today().strftime("%d%m%Y")}.pdf',
                'convertTo': 'pdf'
            }
        }

        resp = requests.post(
            url=f'{cls.document_generator_url}/{file_sha}/render',
            data=json.dumps(body),
            headers={'Content-Type': 'application/json'})
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen-api/generate replied with {str(resp.content)}')

        file_download_resp = Response(
            stream_with_context(resp.iter_content(chunk_size=2048)), headers=dict(resp.headers))

        print("******************", file=sys.stderr)
        print(data, file=sys.stderr)
        application_guid = 'c97cf974-1336-46c3-98e1-fea28a450db3'
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            print("if not now_application_identity", file=sys.stderr)
            raise NotFound('No identity record for this application guid.')

        # DocumentManagerService.initializeFileUploadWithDocumentManager(
        #     request, now_application_identity.mine, 'noticeofwork')

        return file_download_resp

    @classmethod
    def _push_template(cls, template_file_path):
        file = open(template_file_path, 'rb')
        file_name = os.path.basename(template_file_path)
        files = {'template': (file_name, file.read(), mimetypes.guess_type(file_name))}
        resp = requests.post(url=cls.document_generator_url, files=files)
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen-api/push-template replied with {str(resp.text)}')
            return False
        return True

    @classmethod
    def _check_remote_template(cls, template_file_path):
        file_sha = sha256_checksum(template_file_path)
        resp = requests.get(url=f'{cls.document_generator_url}/{file_sha}')
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen-api/check-template replied with {str(resp.content)}')
            return False
        return True
