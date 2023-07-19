import io
import os
import sys
import threading
import boto3
import hashlib
import zipfile
import time

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

class ZipUploadProgressPercentage(object):
    def __init__(self, total_size, save_progress_to_state):
        self._seen_so_far = 0
        self._total_size = total_size
        self._percentage_complete = 0
        self._save_progress_to_state = save_progress_to_state

    def __call__(self, bytes_amount):
        self._save_progress_to_state(self._seen_so_far + bytes_amount, self._total_size)
        self._seen_so_far += bytes_amount
        self._percentage_complete = (self._seen_so_far / self._total_size) * 100

    def get_percentage_complete(self):
        return self._percentage_complete

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

    def write_file_to_zip(self, file_data, file_name, zip_file):
        with zipfile.ZipFile(zip_file, mode='a', compression=zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(file_name, file_data)

    def download_files_and_write_to_zip(self, paths, pretty_paths, zip_file, progress_callback=None):
        # Get the total size of all the files to download
        total_size = sum([self._client.head_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=path)['ContentLength'] for path in paths])

        # Download each file and write it to the zip file
        total_bytes_downloaded = 0
        total_bytes_zipped = 0
        for i, path in enumerate(paths):
            # Download the file from S3
            s3_response = self._client.get_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=path)
            file_data = s3_response['Body'].read()
            total_bytes_downloaded += len(file_data)

            # Get the pretty path for the file and use it to create the zip path
            pretty_path = pretty_paths[i]
            pretty_path = pretty_path.replace('/app/document_uploads', '', 1)
            folder_structure, file_name = os.path.split(pretty_path)
            zip_path = os.path.join(folder_structure, file_name)

            # Write the file to the zip file
            self.write_file_to_zip(file_data, zip_path, zip_file)
            total_bytes_zipped += s3_response['ContentLength']

            # Call the progress callback if provided
            if progress_callback:
                total_bytes_processed = total_bytes_downloaded + total_bytes_zipped
                progress_callback("ZIPPING_FILES", total_bytes_processed, total_size * 2)

    def upload_zip_file(self, file_data, key, file_size, progress_callback=None):
        try:
            def save_progress_to_state(bytes_uploaded, total_bytes):
                progress_callback('UPLOADING_ZIP', bytes_uploaded, total_bytes)

            zip_upload_progress_callback = ZipUploadProgressPercentage(file_size, save_progress_to_state)
            transfer_config = boto3.s3.transfer.TransferConfig(
                multipart_threshold=1024 * 25,
                multipart_chunksize=1024 * 25,
                use_threads=False
            )
            self._client.upload_fileobj(
                Fileobj=file_data,
                Bucket=Config.OBJECT_STORE_BUCKET,
                Key=key,
                Config=transfer_config,
                Callback=zip_upload_progress_callback
            )

            while zip_upload_progress_callback.get_percentage_complete() < 100:
                time.sleep(1)

            return True
        except ClientError as e:
            raise Exception(f'Failed to upload the file: {e}')