import requests, hashlib, mimetypes, json, datetime

from flask import current_app

from app.config import Config


def sha256_checksum(fileobj, block_size=65536):
    sha256 = hashlib.sha256()
    for block in iter(lambda: fileobj.read(block_size), b''):
        sha256.update(block)
    fileobj.seek(0)
    return sha256.hexdigest()


class DocumentGeneratorService():
    document_generator_url = f'{Config.DOCUMENT_GENERATOR_URL}/template'

    @classmethod
    def generate_document(cls, document_template, template_data):

        # Get the template file
        fileobj = None
        dynamic_template = document_template.get_dynamic_template(template_data)
        if dynamic_template:
            fileobj = dynamic_template
        else:
            fileobj = open(document_template.os_template_file_path, 'rb')

        # Push the template file to the Document Generator if it doesn't exist
        file_sha = sha256_checksum(fileobj)
        template_exists = cls._check_remote_template_sha(file_sha)
        if not template_exists:
            cls._push_template(document_template, fileobj)

        # Create the document generation request body
        date_string = datetime.date.today().strftime("%Y-%m-%d")
        report_name = f'{document_template.file_name_no_extension} {date_string}.pdf'
        data = {'data': template_data, 'options': {'reportName': report_name, 'convertTo': 'pdf'}}

        # Send the document generation request and return the response
        resp = requests.post(
            url=f'{cls.document_generator_url}/{file_sha}/render',
            data=json.dumps(data),
            headers={'Content-Type': 'application/json'})
        if resp.status_code != 200:
            current_app.logger.warn(f'Render document request responded with: {str(resp.content)}')

        fileobj.close()
        return resp

    @classmethod
    def _push_template(cls, document_template, template_file):
        file_name = document_template.file_name
        files = {'template': (file_name, template_file, mimetypes.guess_type(file_name))}

        resp = requests.post(url=cls.document_generator_url, files=files)
        if resp.status_code != 200:
            current_app.logger.warn(f'Push template request responded with {str(resp.text)}')

    @classmethod
    def _check_remote_template_sha(cls, file_sha):
        resp = requests.get(url=f'{cls.document_generator_url}/{file_sha}')
        if resp.status_code != 200:
            current_app.logger.warn(f'Check template request responded with: {str(resp.content)}')
            return False

        return True
