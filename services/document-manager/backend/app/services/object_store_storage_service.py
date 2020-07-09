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
            for chunk in iter(lambda: result['Body'].read(1048576), b''):
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

    def upload_file(self, file_name):
        key = f'{Config.S3_PREFIX}{file_name[1:]}'
        self._client.upload_file(Filename=file_name, Bucket=Config.OBJECT_STORE_BUCKET, Key=key)
        if (not self.check_file(key)):
            raise Exception('Failed to upload file')
        return key

    def check_file(self, key):
        objs = list(Config.OBJECT_STORE_BUCKET.objects.filter(Prefix=key))
        return len(objs) > 0 and objs[0].key == key
