import boto3
import io
from flask import send_file, Response, current_app
from app.config import Config


class ObjectStoreStorageService():
    _client = None

    def __init__(self):
        session = boto3.session.Session()
        self._client = session.client(
            service_name='s3',
            aws_access_key_id=Config.OBJECT_STORE_ACCESS_KEY_ID,
            aws_secret_access_key=Config.OBJECT_STORE_ACCESS_KEY,
            endpoint_url=f'https://{Config.OBJECT_STORE_HOST}')

    def download_file(self, path, display_name, as_attachment):
        def generate(result):
            for chunk in iter(lambda: result['Body'].read(5120), b''):
                yield chunk

        s3_response = self._client.get_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=path)
        resp = Response(
            generate(s3_response),
            mimetype='application/pdf' if '.pdf' in display_name.lower() else 'application/zip',
            headers={
                'Content-Disposition':
                ('attachment; ' if as_attachment else '') + ('filename=' + display_name)
            })
        return resp

    # NOTE: Leaving this old method in here for reference and in case we want to use it in the future.
    # def download_file(self, path, display_name, as_attachment):
    #     buffer = io.BytesIO()
    #     self._client.download_fileobj(
    #         Config.OBJECT_STORE_BUCKET, path, buffer, Config=TransferConfig())
    #     buffer.seek(0)
    #     resp = send_file(buffer, attachment_filename=display_name, as_attachment=as_attachment)
    #     current_app.logger.info(f'resp:\n{resp.__dict__}')
    #     return resp