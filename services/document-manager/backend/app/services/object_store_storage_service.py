import io
import os
import sys
import threading
import boto3
import hashlib

from botocore.exceptions import ClientError
from flask import send_file, Response, current_app

from app.config import Config


class ProgressPercentage(object):
    def __init__(self, filename):
        self._filename = filename
        self._size = float(os.path.getsize(filename))
        self._seen_so_far = 0
        self._lock = threading.Lock()

    def __call__(self, bytes_amount):
        with self._lock:
            self._seen_so_far += bytes_amount
            percentage = (self._seen_so_far / self._size) * 100
            sys.stdout.write('\r%s: %.2f%% (%s / %s)' %
                             (self._filename, percentage, self._seen_so_far, self._size))
            sys.stdout.flush()


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

        print('hiiii')
        print(Config.OBJECT_STORE_BUCKET, path, display_name)

        s3_response = self._client.get_object(
            Bucket=Config.OBJECT_STORE_BUCKET, Key=path)
        resp = Response(
            generate(s3_response),
            mimetype='application/pdf' if '.pdf' in display_name.lower() else 'application/zip',
            headers={
                'Content-Disposition':
                ('attachment; ' if as_attachment else '') +
                ('filename=' + display_name)
            })
        return resp

    def upload_file(self, filename, progress=False):
        key = f'{Config.S3_PREFIX}{filename[1:]}'

        # If an object already exists with this key, compare its ETag with the calculated ETag of the local file.
        s3_etag = self.s3_etag(key)
        fs_etag = None
        if s3_etag is not None:
            fs_etag = self.calculate_s3_etag(filename)

            # If the ETags are the same, the files are identical and there is no reason to re-upload.
            if (s3_etag == fs_etag):
                return False, key

        # Upload the file
        try:
            self._client.upload_file(
                Filename=filename,
                Bucket=Config.OBJECT_STORE_BUCKET,
                Key=key,
                Callback=ProgressPercentage(filename) if progress else None)
        except ClientError as e:
            raise Exception(f'Failed to upload the file: {e}')

        # Ensure that the ETag of the uploaded file and local file are equal.
        s3_etag = self.s3_etag(key)
        fs_etag = fs_etag if fs_etag else self.calculate_s3_etag(filename)
        if (s3_etag != fs_etag):
            raise Exception(
                'ETag of the uploaded file and local file do not match!')

        return True, key

    def upload_fileobj(self, filename, fileobj, progress=False):
        key = f'{Config.S3_PREFIX}{filename}'

        # Upload the file
        try:
            self._client.upload_fileobj(
                Fileobj=fileobj,
                Bucket=Config.OBJECT_STORE_BUCKET,
                Key=key,
                Callback=ProgressPercentage(filename) if progress else None)
        except ClientError as e:
            raise Exception(f'Failed to upload the file: {e}')

        return True, key

    def compare_etag(self, filename, key):
        s3_etag = self.s3_etag(key)
        fs_etag = self.calculate_s3_etag(filename)
        return s3_etag == fs_etag

    def copy_file(self, source_key, key):
        copy_source = {'Bucket': Config.OBJECT_STORE_BUCKET, 'Key': source_key}
        self._client.copy(CopySource=copy_source,
                          Bucket=Config.OBJECT_STORE_BUCKET, Key=key)

    def delete_file(self, key):
        self._client.delete_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=key)

    def file_exists(self, key):
        try:
            self._client.head_object(
                Bucket=Config.OBJECT_STORE_BUCKET, Key=key)
            return True
        except ClientError as e:
            if (int(e.response['Error']['Code']) == 404):
                return False
            raise Exception(f'Failed to check if the file exists: {e}')

    # Returns the ETag of an object
    def s3_etag(self, key):
        try:
            etag = self._client.head_object(
                Bucket=Config.OBJECT_STORE_BUCKET, Key=key)['ETag'][1:-1]
        except ClientError:
            etag = None
        return etag

    # This implements the algorithm that is used to generate the ETag (MD5) for stored objects.
    # NOTE: It is CRITICAL that the chunk size matches the chunk size that is used for multi-part uploads (default is 8).
    def calculate_s3_etag(self, filename, chunk_size_mb=8):
        md5s = []
        chunk_size = chunk_size_mb * 1024 * 1024

        if (not os.path.isfile(filename)):
            raise Exception(f'File does not exist: {filename}')

        with open(filename, 'rb') as fp:
            while True:
                data = fp.read(chunk_size)
                if not data:
                    break
                md5s.append(hashlib.md5(data))

        if len(md5s) < 1:
            return '{}'.format(hashlib.md5().hexdigest())

        if len(md5s) == 1:
            return '{}'.format(md5s[0].hexdigest())

        digests = b''.join(m.digest() for m in md5s)
        digests_md5 = hashlib.md5(digests)
        return '{}-{}'.format(digests_md5.hexdigest(), len(md5s))
