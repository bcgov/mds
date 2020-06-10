import boto3
import io
from flask import send_file

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
        buffer = io.BytesIO()
        self._client.download_fileobj(Config.OBJECT_STORE_BUCKET, path, buffer)
        buffer.seek(0)
        return send_file(buffer, attachment_filename=display_name, as_attachment=as_attachment)
