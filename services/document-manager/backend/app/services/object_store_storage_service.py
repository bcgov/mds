import io
import math
import os
import sys
import threading
from datetime import datetime, timedelta
from stat import S_IFREG

import boto3
import hashlib
import zipfile
import time

from botocore.exceptions import ClientError
from flask import send_file, Response, current_app
from stream_zip import stream_zip, ZIP_32

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
    """
    A callback class for tracking the progress of a file upload to S3.

    This class is designed to be passed as a callback in a boto3 upload_fileobj function.
    It tracks the progress of the upload and saves the progress to a state object.

    Args:
        total_size (int): The total size of the file being uploaded.
        progress_callback (callable): A function to update the state of a celery task with the progress of the upload.
    """
    def __init__(self, total_size, progress_callback):
        self._seen_so_far = 0
        self._total_size = total_size
        self._percentage_complete = 0
        self._progress_callback = progress_callback

    def __call__(self, bytes_amount):
        self._progress_callback('UPLOADING_ZIP', self._seen_so_far + bytes_amount, self._total_size)
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

    def download_file(self, path, display_name, as_attachment, version_id=None):
        def generate(result):
            for chunk in iter(lambda: result['Body'].read(1048576), b''):
                yield chunk
        try:
            s3_response = self._client.get_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=path)

            if version_id:
                s3_response = self._client.get_object(
                    Bucket=Config.OBJECT_STORE_BUCKET,
                    Key=path,
                    VersionId=version_id
                )
            else:
                s3_response = self._client.get_object(
                    Bucket=Config.OBJECT_STORE_BUCKET,
                    Key=path
                )

            resp = Response(
                generate(s3_response),
                mimetype='application/pdf' if '.pdf' in display_name.lower() else 'application/zip',
                headers={
                    'Content-Disposition':
                        ('attachment; ' if as_attachment else '') + ('filename=' + display_name)
                })

            return resp

        except ClientError as e:
            raise Exception(f'Failed to download the file: {e}')

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
            raise Exception('ETag of the uploaded file and local file do not match!')

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
        try:
            copy_source = {'Bucket': Config.OBJECT_STORE_BUCKET, 'Key': source_key}
            self._client.copy(CopySource=copy_source, Bucket=Config.OBJECT_STORE_BUCKET, Key=key)
        except ClientError as e:
            raise Exception(f'copy_file: {e}')

    def delete_file(self, key):
        try:
            self._client.delete_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=key)
        except ClientError as e:
            raise Exception(f'delete_file: {e}')

    def file_exists(self, key):
        try:
            self._client.head_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=key)
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

    def upload_zip_file(self, file_data, key, file_size, progress_callback):
        """
            Uploads a zip file to the S3 bucket.
            args:
            file_data (file): The zip file data to upload.
            key (str): The key to use for the uploaded file.
            file_size (int): The size of the file in bytes.
            progress_callback (callable): A function to update the state of a celery task with the progress of the upload.
        """
        try:

            # Create a callback for tracking the progress of the upload
            zip_upload_progress_callback = ZipUploadProgressPercentage(total_size=file_size, progress_callback=progress_callback)

            # Create a transfer config for the upload - forcing the us of a single thread is to avoid boto3 marking the task as complete before the callback has finished.
            transfer_config = boto3.s3.transfer.TransferConfig(
                multipart_threshold=1024 * 25,
                multipart_chunksize=1024 * 25,
                use_threads=False
            )

            # Upload the zip file to the S3 bucket
            self._client.upload_fileobj(
                Fileobj=file_data,
                Bucket=Config.OBJECT_STORE_BUCKET,
                Key=key,
                Config=transfer_config,
                Callback=zip_upload_progress_callback
            )

            # Wait for the upload to complete
            while zip_upload_progress_callback.get_percentage_complete() < 100:
                time.sleep(1)
            
            return True
        except ClientError as e:
            raise Exception(f'Failed to upload the file: {e}')

    def __download_in_chunks(self, key):
        # Generator function to download file in chunks of 8MB size

        # Get the object from S3
        response = self._client.get_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=key)

        # Read the object in chunks and yield them one by one
        for chunk in response['Body'].iter_chunks(chunk_size=8 * 1024 * 1024):
            yield chunk

    def create_zip_and_upload(self, key, document_paths, pretty_paths, progress_callback):
        # Calculate the total size of all the files
        total_size = sum(
            self._client.head_object(Bucket=Config.OBJECT_STORE_BUCKET, Key=path)['ContentLength'] for path in
            document_paths)

        def local_files():
            # Get the current timestamp
            now = datetime.now()

            def contents(path):
                # A generator function to slowly take data (in chunks) from S3 without loading the whole file in the memory.
                for chunk in self.__download_in_chunks(path):
                    yield chunk

            # Return a generator with tuples of file parameters for each file
            return (
                (pretty_path, now, S_IFREG | 0o600, ZIP_32, contents(document_path))
                for document_path, pretty_path in zip(document_paths, pretty_paths)
            )

        def to_file_like_obj(iterable):
            # This function takes a generator that continuously generates file data and produces a file-like object

            chunk = b''
            offset = 0
            it = iter(iterable)

            def up_to_iter(size):
                # Internal function to yield chunks from the iterable. Ensures we only read up to 'size' bytes from the file.

                nonlocal chunk, offset
                while size:
                    if offset == len(chunk):
                        try:
                            chunk = next(it)
                        except StopIteration:
                            break
                        else:
                            offset = 0
                    to_yield = min(size, len(chunk) - offset)
                    offset = offset + to_yield
                    size -= to_yield
                    yield chunk[offset - to_yield:offset]

            class FileLikeObj:
                # A class that creates an object which behaves like a file. Instead of reading from disk, we're reading from the generator.

                def read(self, size=-1):
                    # Read a specific size from the iterator
                    return b''.join(up_to_iter(float('inf') if size is None or size < 0 else size))

            return FileLikeObj()

        # Create an iterator to loop over the zipfiles and read chunks of the zip file data
        zipped_chunks = stream_zip(local_files())
        # Convert the iterator to a file-like object
        zipped_chunks_obj = to_file_like_obj(zipped_chunks)

        # Get the total size of the zip file
        zip_upload_progress_callback = ZipUploadProgressPercentage(total_size=total_size,
                                                                   progress_callback=progress_callback)
        """
            Finally, the generated zip content is streamed to S3.
            The upload_fileobj function takes a file-like object as input, which in our scenario, 
            is reading from the chunks generated by our zip streaming function. 
            This approach ensures that our application only needs to load a small part of the file into memory at a time, 
            allowing us to handle large files with minimal memory footprint.
        """
        self._client.upload_fileobj(
            Fileobj=zipped_chunks_obj,
            Bucket=Config.OBJECT_STORE_BUCKET,
            Key=key,
            Config=boto3.s3.transfer.TransferConfig(multipart_chunksize=1024 * 1024 * 8, use_threads=False),
            Callback=zip_upload_progress_callback
        )

    def create_multipart_upload(self, key, file_size):
        # Create multipart upload that must be completed in 1 day
        upload = self._client.create_multipart_upload(Bucket=Config.OBJECT_STORE_BUCKET, Key=key, Expires=datetime.now() + timedelta(days=1), ContentType='application/pdf')

        upload_id = upload['UploadId']
        parts = self.create_multipart_upload_urls(key, upload_id, file_size)

        return {
            "uploadId": upload_id,
            "parts": parts
        }
    
    def create_multipart_upload_urls(self, key, uploadId, file_size):
        chunk_size = 5 * 1024 * 1024

        num_chunks = math.ceil(file_size / chunk_size)
        print(file_size, chunk_size, num_chunks)

        upload_urls = []

        for i in range(num_chunks):
            part_size = chunk_size
            part_no = i + 1
            if i == num_chunks:
                # last chunk should cover the remaining of what's left of the file
                part_size = file_size - (chunk_size * len(chunk_size - 1))

            upload_url = self._sign_upload_url(key, uploadId, part_no, part_size)

            upload_urls.append({
                "part": part_no,
                "size": part_size,
                "url": upload_url
            })

        return upload_urls

    
    def _sign_upload_url(self, key, uploadId, part_no, part_size):
        return self._client.generate_presigned_url(
            ClientMethod='upload_part',
            HttpMethod='PUT',
            ExpiresIn=3600,
            Params={
                "Bucket": Config.OBJECT_STORE_BUCKET,
                "Key": key,
                "UploadId": uploadId,
                "PartNumber": part_no,
                # "ContentLength": part_size
            }
        )


    def complete_multipart_upload(self, uploadId, key, parts):
        return self._client.complete_multipart_upload(
            Bucket=Config.OBJECT_STORE_BUCKET,
            Key=key,
            UploadId=uploadId,
            MultipartUpload={
                'Parts': [{
                    'ETag': part['etag'],
                    'PartNumber': part['part']
                } for part in parts]
            }
        )
                               
