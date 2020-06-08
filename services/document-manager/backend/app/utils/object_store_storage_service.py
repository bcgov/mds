import boto3
import io
import asyncio
from app.config import Config

from flask import send_file, current_app

from pathlib import Path


class ObjectStoreStorageService():
    _client = None

    def __init__(self):
        session = boto3.session.Session()
        self._client = session.client(
            service_name='s3',
            aws_access_key_id=Config.OBJECT_STORE_ACCESS_KEY_ID,
            aws_secret_access_key=Config.OBJECT_STORE_ACCESS_KEY,
            endpoint_url=f'https://{Config.OBJECT_STORE_HOST}')

    def list_files(self):
        """
        Function to list files in a given S3 bucket
        """
        contents = []

        for item in self._client.list_objects(Bucket=Config.OBJECT_STORE_BUCKET)['Contents']:
            contents.append(item)

        return contents

    def upload_file(self, file_name):
        """
        Function to upload a file to an S3 bucket
        """
        object_name = file_name
        response = self._client.upload_file(file_name, Config.OBJECT_STORE_BUCKET, object_name)

        return response

    def download_file(self, path, display_name, as_attachment):
        """
        Function to download a given file from an S3 bucket
        """
        buffer = io.BytesIO()
        current_app.logger.info(path)
        self._client.download_fileobj(Config.OBJECT_STORE_BUCKET, path, buffer)
        #TODO avoid full buffered transfer, stream response instead
        buffer.seek(0)
        return send_file(buffer, attachment_filename=display_name, as_attachment=as_attachment)

    def check_file(self, path):
        """
        Check if a given key is in a S3 bucket
        """
        objs = list(bucket.objects.filter(Prefix=key))
        if len(objs) > 0 and objs[0].key == key:
            print("Exists!")
        else:
            print("Doesn't exist")
