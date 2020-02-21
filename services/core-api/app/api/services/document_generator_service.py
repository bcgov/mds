import requests, hashlib, os, mimetypes, json
from flask import Response, current_app, stream_with_context
from app.config import Config


def sha256_checksum(filename, block_size=65536):
    sha256 = hashlib.sha256()
    with open(filename, 'rb') as f:
        for block in iter(lambda: f.read(block_size), b''):
            sha256.update(block)
    return sha256.hexdigest()


class DocumentGeneratorService():
    document_generator_url = 'http://docgen-api:3030/template'

    @classmethod
    def generate_document_and_stream_response(cls, file_path, data):
        current_app.logger.warn(f'CHECKING TEMPLATE')
        temp_exists = cls._check_remote_template(file_path)
        if not temp_exists:
            current_app.logger.warn(f'PUSHING TEMPLATE')
            cls._push_template(file_path)

        file_sha = sha256_checksum(file_path)
        file_name = os.path.basename(file_path)

        # https://carbone.io/api-reference.html#native-api
        current_app.logger.debug(data)
        body = {'data': data, 'options': {'convertTo': 'pdf', 'reportName': file_name + '.pdf'}}
        current_app.logger.debug(type(data))

        current_app.logger.debug(body)
        resp = requests.post(url=f'{cls.document_generator_url}/{file_sha}/render', data=body)
        if resp.status_code != 200:
            current_app.logger.warn(f'3 Docgen service replied with {str(resp.content)}')

        file_download_resp = Response(stream_with_context(resp.iter_content(chunk_size=2048)))
        file_download_resp.headers['Content-Type'] = resp.headers['Content-Type']
        file_download_resp.headers['Content-Disposition'] = f'attachment; filename="{file_name}"'

        return file_download_resp

    @classmethod
    def _push_template(cls, file_path):
        file = open(file_path, 'rb')
        file_name = os.path.basename(file_path)
        files = {'template': (file_name, file.read(), mimetypes.guess_type(file_name))}
        resp = requests.post(url=cls.document_generator_url, files=files)
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen service replied with {str(resp.text)}')
            return False
        return True

    @classmethod
    def _check_remote_template(cls, file_path):
        file_sha = sha256_checksum(file_path)

        resp = requests.get(url=f'{cls.document_generator_url}/{file_sha}')
        if resp.status_code != 200:
            current_app.logger.warn(f'Docgen service replied with {str(resp.content)}')
            return False
        return True
