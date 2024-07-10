import json
from unittest import mock

from tests.factories import DocumentFactory


def test_complete_bundle_upload_single_kml(test_client, db_session, auth_headers, tmp_path):
    # Setup
    document = DocumentFactory(path_root=tmp_path, file_display_name='testfile.kml')
    document_guids = [document.document_guid]
    payload = {
        'bundle_document_guids': document_guids,
        'name': 'test_bundle'
    }

    with mock.patch('app.utils.document_upload_helper.ObjectStoreStorageService.download_file'), \
            mock.patch(
                'app.utils.document_upload_helper.DocumentUploadHelper.send_spatial_file_to_geomark') as mock_send_spatial:
        mock_send_spatial.return_value = {'id': 'dummy_geomark_id'}

        response = test_client.patch('/documents/complete-bundle', json=payload,
                                     headers=auth_headers['full_auth_header'])

    assert response.status_code == 200

def test_complete_bundle_upload_single_kmz(test_client, db_session, auth_headers, tmp_path):
    # Setup
    document = DocumentFactory(path_root=tmp_path, file_display_name='testfile.kmz')
    document_guids = [document.document_guid]
    payload = {
        'bundle_document_guids': document_guids,
        'name': 'test_bundle'
    }

    with mock.patch('app.utils.document_upload_helper.ObjectStoreStorageService.download_file'), \
            mock.patch(
                'app.utils.document_upload_helper.DocumentUploadHelper.send_spatial_file_to_geomark') as mock_send_spatial:

        # Assume we will be getting a successful response from 'send_spatial_file_to_geomark'
        mock_send_spatial.return_value = {'id': 'dummy_geomark_id'}

        # Execute
        response = test_client.patch('/documents/complete-bundle', json=payload,
                                     headers=auth_headers['full_auth_header'])

    # Assert
    assert response.status_code == 200

def test_complete_bundle_upload_single_invalid(test_client, db_session, auth_headers, tmp_path):
    # Setup
    document = DocumentFactory(path_root=tmp_path, file_display_name='testfile.jpg')
    document_guids = [document.document_guid]
    payload = {
        'bundle_document_guids': document_guids,
        'name': 'test_bundle'
    }

    with mock.patch('app.utils.document_upload_helper.ObjectStoreStorageService.download_file'), \
            mock.patch(
                'app.utils.document_upload_helper.DocumentUploadHelper.send_spatial_file_to_geomark') as mock_send_spatial:

        # Assume we will be getting a successful response from 'send_spatial_file_to_geomark'
        mock_send_spatial.return_value = {'id': 'dummy_geomark_id'}

        # Execute
        response = test_client.patch('/documents/complete-bundle', json=payload,
                                     headers=auth_headers['full_auth_header'])

    # Assert
    assert response.status_code == 400

def test_complete_bundle_upload_multiple_file_types_valid(test_client, db_session, auth_headers, tmp_path):
    # Setup
    documents = [DocumentFactory(path_root=tmp_path, file_display_name=f'testfile{i}.{ext}')
                 for i, ext in enumerate(['shp', 'shx', 'dbf', 'prj', 'sbn', 'sbx', 'xml'])]
    document_guids = [document.document_guid for document in documents]
    payload = {
        'bundle_document_guids': document_guids,
        'name': 'test_bundle'
    }

    with mock.patch('app.utils.document_upload_helper.ObjectStoreStorageService.download_file'), \
            mock.patch(
                'app.utils.document_upload_helper.DocumentUploadHelper.send_spatial_file_to_geomark') as mock_send_spatial:
        mock_send_spatial.return_value = {'id': 'dummy_geomark_id'}

        response = test_client.patch('/documents/complete-bundle', json=payload,
                                     headers=auth_headers['full_auth_header'])
    assert response.status_code == 200

def test_complete_bundle_upload_multiple_file_types_invalid(test_client, db_session, auth_headers, tmp_path):
    documents = [DocumentFactory(path_root=tmp_path, file_display_name=f'testfile{i}.{ext}')
                 for i, ext in enumerate(['shp', 'jpg'])]
    document_guids = [document.document_guid for document in documents]
    payload = {
        'bundle_document_guids': document_guids,
        'name': 'test_bundle'
    }

    with mock.patch('app.utils.document_upload_helper.ObjectStoreStorageService.download_file'), \
            mock.patch(
                'app.utils.document_upload_helper.DocumentUploadHelper.send_spatial_file_to_geomark') as mock_send_spatial:
        mock_send_spatial.return_value = {'id': 'dummy_geomark_id'}

        response = test_client.patch('/documents/complete-bundle', json=payload,
                                     headers=auth_headers['full_auth_header'])
    assert response.status_code == 400