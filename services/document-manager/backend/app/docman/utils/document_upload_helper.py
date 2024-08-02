import base64
import mimetypes
import os
import time
import zipfile
from datetime import datetime
from urllib.parse import urlparse
from wsgiref.handlers import format_date_time

import requests
from app.config import Config
from app.constants import (
    FILE_UPLOAD_EXPIRY,
    FILE_UPLOAD_OFFSET,
    FILE_UPLOAD_PATH,
    FILE_UPLOAD_SIZE,
    FORBIDDEN_FILETYPES,
    OBJECT_STORE_PATH,
    OBJECT_STORE_UPLOAD_RESOURCE,
    TIMEOUT_24_HOURS,
    TUS_API_SUPPORTED_VERSIONS,
    TUS_API_VERSION,
)
from app.docman.models.document import Document
from app.docman.models.document_bundle import DocumentBundle
from app.docman.models.document_version import DocumentVersion
from app.extensions import cache, db
from app.services.object_store_storage_service import ObjectStoreStorageService
from flask import current_app, jsonify, make_response, request
from requests_toolbelt import MultipartEncoder
from werkzeug.exceptions import (
    BadGateway,
    BadRequest,
    InternalServerError,
    NotFound,
    RequestEntityTooLarge,
)
from werkzeug.utils import secure_filename

from .geomark_helper import GeomarkHelper

CACHE_TIMEOUT = TIMEOUT_24_HOURS


def handle_status_and_update_doc(status, doc_guid):
    doc = Document.find_by_document_guid(doc_guid)
    db.session.rollback()
    doc.status = str(status)
    db.session.add(doc)
    db.session.commit()


class DocumentUploadHelper:

    @classmethod
    def initiate_document_upload(cls, document_guid, file_path, folder, file_size, version_guid=None):
        folder = secure_filename(folder) if folder else None
        file_path = secure_filename(file_path)

        # If the object store is enabled, send the post request through to TUSD to the object store
        object_store_path = None
        s3_upload = None
        multipart_upload_path = None
        is_s3_multipart = False

        if Config.OBJECT_STORE_ENABLED:

            # Add the path to be used in the post-finish tusd hook to set the correct object store path
            headers = {key: value for (
                key, value) in request.headers if key != 'Host'}
            path = base64.b64encode(file_path.encode('utf-8')).decode('utf-8')
            doc_guid = base64.b64encode(
                document_guid.encode('utf-8')).decode('utf-8')

            is_s3_multipart = headers.get('Upload-Protocol') == 's3-multipart'
            upload_metadata = request.headers['Upload-Metadata']
            headers['Upload-Metadata'] = f'{upload_metadata},path {path},doc_guid {doc_guid}'

            if version_guid is not None:
                ver_guid = base64.b64encode(
                    str(version_guid).encode('utf-8')).decode('utf-8')

                headers['Upload-Metadata'] = headers['Upload-Metadata'] + \
                                             f',version_guid {ver_guid}'

            # Send the request
            if is_s3_multipart:
                object_store_path = Config.S3_PREFIX + 'multipart/' + doc_guid
                multipart_upload_path = object_store_path
                s3_upload = ObjectStoreStorageService().create_multipart_upload(object_store_path, file_size)
            else:
                object_store_path = cls._initialize_tusd_upload(document_guid, headers)
        # Else, create an empty file at this path in the file system
        else:
            try:
                if not os.path.exists(folder):
                    os.makedirs(folder)
                with open(file_path, 'wb') as f:
                    f.seek(file_size - 1)
                    f.write(b'\0')
            except IOError as e:
                current_app.logger.error(e)
                raise InternalServerError('Unable to create file')

        # Cache data to be used in future PATCH requests
        upload_expiry = format_date_time(time.time() + CACHE_TIMEOUT)

        if not is_s3_multipart:
            cache.set(FILE_UPLOAD_EXPIRY(document_guid),
                      upload_expiry, CACHE_TIMEOUT)
            cache.set(FILE_UPLOAD_SIZE(document_guid), file_size, CACHE_TIMEOUT)
            cache.set(FILE_UPLOAD_OFFSET(document_guid), 0, CACHE_TIMEOUT)
            cache.set(FILE_UPLOAD_PATH(document_guid), file_path, CACHE_TIMEOUT)

        # Create and send response
        response = make_response(
            jsonify(
                document_manager_guid=document_guid,
                upload=s3_upload
            ), 201)

        if version_guid is not None:
            response = make_response(
                jsonify(
                    document_manager_guid=document_guid,
                    document_manager_version_guid=version_guid,
                    upload=s3_upload
                ), 201)

        if not is_s3_multipart:
            response.headers['Tus-Resumable'] = TUS_API_VERSION
            response.headers['Tus-Version'] = TUS_API_SUPPORTED_VERSIONS
            response.headers[
                'Access-Control-Expose-Headers'] = 'Tus-Resumable,Tus-Version,Location,Upload-Offset,Upload-Expires,Content-Type'

        response.headers['Location'] = f'{Config.DOCUMENT_MANAGER_URL}/documents/{document_guid}'
        response.headers['Upload-Offset'] = 0
        response.headers['Upload-Expires'] = upload_expiry

        if version_guid is not None:
            response.headers['Document-Version'] = version_guid

            if not is_s3_multipart:
                response.headers[
                    'Access-Control-Expose-Headers'] = response.headers[
                                                           'Access-Control-Expose-Headers'] + ',Document-Version'

        response.autocorrect_location_header = False

        return response, object_store_path, multipart_upload_path, s3_upload[
            'uploadId'] if s3_upload is not None else None

    @classmethod
    def _initialize_tusd_upload(cls, document_guid, headers):
        resp = None
        try:
            resp = requests.post(url=Config.TUSD_URL,
                                 headers=headers, data=request.data)
        except Exception as e:
            message = f'POST request to object store raised an exception:\n{e}'
            current_app.logger.error(message)
            raise InternalServerError(message)

            # Validate the request
        if resp.status_code != requests.codes.created:
            message = f'POST request to object store failed: {resp.status_code} ({resp.reason}): {resp._content}'
            current_app.logger.error(
                f'POST resp.request:\n{resp.request.__dict__}')
            current_app.logger.error(f'POST resp:\n{resp.__dict__}')
            current_app.logger.error(message)
            if resp.status_code == requests.codes.not_found:
                raise NotFound(message)
            raise BadGateway(message)

            # Set object store upload data in cache
        object_store_upload_resource = urlparse(
            resp.headers['Location']).path.split('/')[-1]
        object_store_path = Config.S3_PREFIX + \
                            object_store_upload_resource.split('+')[0]
        cache.set(
            OBJECT_STORE_UPLOAD_RESOURCE(
                document_guid), object_store_upload_resource,
            CACHE_TIMEOUT)
        cache.set(OBJECT_STORE_PATH(document_guid),
                  object_store_path, CACHE_TIMEOUT)

        return object_store_path

    @classmethod
    def parse_and_validate_uploaded_file(cls, data):
        """
        Parses and validates the given parsed request data
        to make sure the file and the associated metadata is
        Tusd compatible and matches files that the system can accept
        """
        if request.headers.get('Tus-Resumable') is None and request.headers.get('Upload-Protocol') != 's3-multipart':
            raise BadRequest(
                'Received file upload for unsupported file transfer protocol')

        # Validate the file size
        file_size = request.headers.get('Upload-Length')
        if not file_size:
            raise BadRequest('Received file upload of unspecified size')
        file_size = int(file_size)
        max_file_size = Config.MAX_CONTENT_LENGTH
        if file_size > max_file_size:
            raise RequestEntityTooLarge(
                f'The maximum file upload size is {max_file_size / 1024 / 1024}MB.')

        # Validate the file name and file type
        filename = data.get('filename') or request.headers.get('Filename')
        if not filename:
            raise BadRequest('File name cannot be empty')
        if filename.endswith(FORBIDDEN_FILETYPES):
            raise BadRequest('File type is forbidden')

        return file_size, data, filename

    @classmethod
    def complete_multipart_upload(cls, upload_id, parts, document, version=None, is_bundle=False):
        ObjectStoreStorageService().complete_multipart_upload(upload_id, document.multipart_upload_path, parts)

        # File has been uploaded to S3 in the {Config.S3_PREFIX}/multipart folder, now move it to its final destination
        key_prefix = Config.S3_PREFIX[:-1] if Config.S3_PREFIX and Config.S3_PREFIX != '/' else ''
        upload_destination_path = f'{key_prefix}{document.full_storage_path}'
        return cls.complete_upload(
            key=document.multipart_upload_path,
            new_key=upload_destination_path,
            doc_guid=str(document.document_guid),
            versions=None,
            version_guid=str(version.id) if version is not None else None,
            info_key=None,
            is_bundle=is_bundle
        )

    @classmethod
    def complete_upload(cls, key, new_key, doc_guid, versions=None, version_guid=None, info_key=None, is_bundle=False):
        oss = ObjectStoreStorageService()

        # Copy the file to its new location
        try:

            oss.copy_file(source_key=key, key=new_key)

            if version_guid is not None and versions is None:
                versions = oss.list_versions(new_key)['Versions']

        except Exception as e:
            handle_status_and_update_doc(e, doc_guid)
            raise e

        # Update the document's object store path and create a new version
        try:
            db.session.rollback()

            doc = Document.find_by_document_guid(doc_guid)
            if doc.object_store_path != new_key:
                doc.object_store_path = new_key
                doc.update_user = 'mds'

                if not is_bundle:
                    doc.upload_completed_date = datetime.utcnow()

                db.session.add(doc)

            # update the record of the previous version
            if versions is not None and len(versions) >= 1:
                # Sort the versions
                versions.sort(key=lambda v: v["LastModified"], reverse=True)

                # create a version record for the previous version
                previous_version_data = versions[0]

                # get the versionId of the previous version
                previous_version_id = previous_version_data["VersionId"]

                # find the corresponding DocumentVersion record
                if version_guid is not None:
                    previous_version = DocumentVersion.find_by_id(version_guid)

                    if previous_version is not None:
                        previous_version.object_store_version_id = previous_version_id
                        previous_version.upload_completed_date = datetime.utcnow()

                        db.session.add(previous_version)

            db.session.commit()

        except Exception as e:
            handle_status_and_update_doc(e, doc_guid)
            raise e

        # Delete the old file and its .info file
        try:
            ObjectStoreStorageService().delete_file(key)

            if info_key:
                ObjectStoreStorageService().delete_file(info_key)
        except Exception as e:
            handle_status_and_update_doc(e, doc_guid)
            raise e

        # If there are no exceptions up to this point, set the status to 'Success'
        handle_status_and_update_doc('Success', doc_guid)

        return ('', 204)

    @classmethod
    def validate_bundle(cls, bundle_documents):
        required_extensions = {'.shp', '.shx', '.dbf', '.prj'}
        optional_extensions = {'.sbn', '.sbx', '.xml'}
        all_shape_file_extensions = required_extensions.union(optional_extensions)
        valid_single_file_extensions = {'.kml', '.kmz'}

        if len(bundle_documents) == 1:
            document_extension = os.path.splitext(bundle_documents[0].file_display_name)[1]

            if document_extension in all_shape_file_extensions:
                raise ValueError(f'${document_extension} must be uploaded as part of a shapefile')
            if document_extension not in valid_single_file_extensions:
                raise ValueError(f'Invalid file type: {document_extension}')
        else:
            allowed_extensions = required_extensions.union(optional_extensions)

            # assuming Document.file_display_name or similar method gives file name including extension
            document_extensions = {os.path.splitext(doc.file_display_name)[1] for doc in bundle_documents}

            if not required_extensions.issubset(document_extensions):
                missing_extensions = required_extensions - document_extensions
                raise ValueError(f'Missing required file types: {", ".join(missing_extensions)}')

            extra_extensions = document_extensions - allowed_extensions
            if extra_extensions:
                raise ValueError(
                    f'Found non spatial bundle file types in spatial bundle: {", ".join(extra_extensions)}')

    @classmethod
    def zip_spatial_files(cls, bundle_documents, file_path):
        oss_service = ObjectStoreStorageService()

        with zipfile.ZipFile(file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for doc in bundle_documents:
                response = oss_service.download_file(doc.object_store_path, doc.file_display_name, False)

                if response.status_code == 200:
                    current_app.logger.info(f"Successfully downloaded document: {doc.file_display_name}")
                    file_data = response.get_data()

                    zipf.writestr(doc.file_display_name, file_data)
                else:
                    raise Exception(f"Failed to download document: {doc.file_display_name}")

    @classmethod
    def download_kml_kmz_files(cls, doc, file_path):
        # Download the file from object store
        response = ObjectStoreStorageService().download_file(doc.object_store_path, doc.file_display_name, False)

        # Check the response status
        if response.status_code == 200:
            file_data = response.get_data()  # obtain file data from response body

            with open(file_path, 'wb') as file:
                file.write(file_data)
        else:
            raise FileNotFoundError(f"Failed to download file: {doc.file_display_name}")

    @classmethod
    def complete_bundle_upload(cls, bundle_document_guids, name):
        bundle_documents = Document.find_by_document_guid_many(bundle_document_guids)

        if len(bundle_documents) != len(bundle_document_guids) or not bundle_documents:
            raise NotFound('One or more documents not found')

        cls.validate_bundle(bundle_documents)

        # If this is a spatial bundle, zip it to .shpz
        if len(bundle_documents) > 1:
            file_path = f'/tmp/spatial/{secure_filename(name)}.shpz'
            cls.zip_spatial_files(bundle_documents, file_path)
        # Otherwise validate and download the single spatial file
        else:
            file_path = (f'/tmp/spatial/{secure_filename(bundle_documents[0].file_display_name)}')
            cls.download_kml_kmz_files(bundle_documents[0], file_path)

        geomark_response = GeomarkHelper().send_spatial_file_to_geomark(file_path)

        bundle = DocumentBundle(
            name=name,
        )

        if not geomark_response:
            raise RuntimeError(f'Geomark API request failed')

        if geomark_response.get('error'):
            bundle.error = geomark_response['error']

        if geomark_response.get('url'):
            bundle.geomark_id = geomark_response['id']

        for doc in bundle_documents:
            doc.document_bundle = bundle
            if geomark_response.get('url'):
                doc.upload_completed_date = datetime.utcnow()
            db.session.add(doc)

        db.session.add(bundle)
        db.session.commit()

        if bundle.error:
            raise BadRequest(bundle.error)

        current_app.logger.info(f'Completed bundle upload: {bundle.geomark_id}')

        return {'geomark_id': bundle.geomark_id, 'docman_bundle_guid': str(bundle.bundle_guid)}
