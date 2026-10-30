import uuid
from types import SimpleNamespace
from unittest import mock

import pytest
from werkzeug.exceptions import InternalServerError

from app.config import Config
from app.docman.utils.document_upload_helper import DocumentUploadHelper

HELPER_MODULE = 'app.docman.utils.document_upload_helper'
S3_PREFIX = 'mds-files-test/'


def make_document(full_storage_path, object_store_path):
    doc_guid = uuid.uuid4()
    return SimpleNamespace(
        document_guid=doc_guid,
        full_storage_path=full_storage_path,
        object_store_path=object_store_path,
        multipart_upload_path=f'{S3_PREFIX}multipart/{doc_guid}',
        upload_completed_date=None,
        update_user='original-user',
        file_display_name='original.pdf',
    )


@pytest.fixture
def upload_mocks(test_client):
    """Mocks the object store and database used by complete_multipart_upload / complete_upload"""
    with mock.patch.object(Config, 'S3_PREFIX', S3_PREFIX), \
            mock.patch(f'{HELPER_MODULE}.ObjectStoreStorageService') as oss_class, \
            mock.patch(f'{HELPER_MODULE}.db') as db, \
            mock.patch(f'{HELPER_MODULE}.Document') as document_model, \
            mock.patch(f'{HELPER_MODULE}.DocumentVersion') as version_model:
        yield SimpleNamespace(
            oss=oss_class.return_value,
            db=db,
            document_model=document_model,
            version_model=version_model,
        )


def complete_version_upload(mocks, document, versions):
    """Replaces the document's file, with the object store holding the given versions"""
    version = SimpleNamespace(
        id=uuid.uuid4(), object_store_version_id=None, upload_completed_date=None, file_display_name='replacement.pdf')
    mocks.document_model.find_by_document_guid.return_value = document
    mocks.version_model.find_by_id.return_value = version
    mocks.oss.list_versions.return_value = {'Versions': versions}

    DocumentUploadHelper.complete_multipart_upload(
        upload_id='upload-id', parts=[], document=document, version=version)

    # Nothing is copied over the document's file until the replacement is committed
    mocks.oss.copy_file.assert_not_called()

    DocumentUploadHelper.complete_upload(
        key=DocumentUploadHelper.version_temp_key(document.document_guid, version.id),
        new_key=DocumentUploadHelper.upload_destination_path(document),
        doc_guid=str(document.document_guid),
        version_guid=str(version.id),
        update_doc_status_on_error=False,
        new_file_display_name=version.file_display_name,
    )

    return version


def test_replace_imported_document_keeps_original_key(upload_mocks):
    """Imported NoW documents have no full_storage_path, so the new version must land on the existing key"""
    original_key = f'{S3_PREFIX}8104143f-5c75-4624-99ee-9d9c1cc8e9a3/VFCBC/test5.pdf'
    document = make_document(full_storage_path='', object_store_path=original_key)
    versions = [
        {'Key': original_key, 'VersionId': 'new-version', 'LastModified': 2},
        {'Key': original_key, 'VersionId': 'imported-version', 'LastModified': 1},
    ]

    version = complete_version_upload(upload_mocks, document, versions)

    upload_mocks.oss.copy_file.assert_called_once_with(
        source_key=DocumentUploadHelper.version_temp_key(document.document_guid, version.id), key=original_key)
    upload_mocks.oss.list_versions.assert_called_once_with(original_key)
    assert document.object_store_path == original_key
    assert document.update_user == 'original-user'
    # The original import becomes the previous version
    assert version.object_store_version_id == 'imported-version'


def test_replace_uploaded_document_uses_full_storage_path(upload_mocks):
    """Documents uploaded through Core/MineSpace keep using their full_storage_path as the key"""
    full_storage_path = '/app/document_uploads/mines/abc/documents/file-guid'
    expected_key = f'mds-files-test{full_storage_path}'
    document = make_document(full_storage_path=full_storage_path, object_store_path=expected_key)

    version = complete_version_upload(upload_mocks, document, versions=[])

    upload_mocks.oss.copy_file.assert_called_once_with(
        source_key=DocumentUploadHelper.version_temp_key(document.document_guid, version.id), key=expected_key)
    assert document.object_store_path == expected_key


@pytest.mark.parametrize('object_store_path', [
    None,
    '',
    'mds-files-test',
    'mds-files-test/',
    'mds-files-test/8104143f-5c75-4624-99ee-9d9c1cc8e9a3/VFCBC/',
    'mds-files-test/multipart/6a4c2c9e-5a8e-4a6e-9a39-6d2f0b3c1f11',
])
def test_replace_rejects_invalid_destination(upload_mocks, object_store_path):
    """Fails before writing anything when the destination is not a real file key"""
    document = make_document(full_storage_path='', object_store_path=object_store_path)

    with pytest.raises(InternalServerError):
        complete_version_upload(upload_mocks, document, versions=[])

    with pytest.raises(InternalServerError):
        DocumentUploadHelper.upload_destination_path(document)

    upload_mocks.oss.complete_multipart_upload.assert_not_called()
    upload_mocks.oss.copy_file.assert_not_called()
    upload_mocks.db.session.commit.assert_not_called()
