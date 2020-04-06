import requests, hashlib, os, mimetypes, json, datetime
from flask import Response, current_app, stream_with_context
from app.config import Config


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

        # Ensure that the desired template exists
        current_app.logger.debug(f'CHECKING TEMPLATE at {template_file_path}')
        template_exists = cls._check_remote_template(template_file_path)
        if not template_exists:
            current_app.logger.debug(f'PUSHING TEMPLATE at {template_file_path}')
            cls._push_template(template_file_path)

        # Create the document generation request
        file_sha = sha256_checksum(template_file_path)
        file_name = os.path.basename(template_file_path)
        file_name_no_ext = '.'.join(file_name.split('.')[:-1])
        # https://carbone.io/api-reference.html#native-api
        body = {
            'data': data,
            'options': {
                'reportName': f'{file_name_no_ext}-{datetime.date.today().strftime("%d%m%Y")}.pdf',
                'convertTo': 'pdf'
            }
        }

        # Send the document generation request and return the response
        resp = requests.post(
            url=f'{cls.document_generator_url}/{file_sha}/render',
            data=json.dumps(body),
            headers={'Content-Type': 'application/json'})
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen-api/generate replied with {str(resp.content)}')

        return resp

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
