import json
import io
import filecmp
import os
import pytest
import shutil


# @pytest.fixture(scope="function")
# def setup_info(test_client):
#     base_path = test_client.application.config['UPLOADED_DOCUMENT_DEST']

#     if os.path.exists(f'{base_path}/test'):
#         shutil.rmtree(f'{base_path}/test')

#     yield dict(
#         mine_guid='3bc222ec-0f1f-49dd-bf5e-13bddab4725e',
#         mine_no='BLAH2905',
#         base_path=base_path,
#         test_file_pdf=io.BytesIO(b'Test File pdf'),
#         test_file_pdf_name='test_file_1.pdf',
#         test_file_doc=io.BytesIO(b'Test File doc'),
#         test_file_doc_name='test_file_2.doc',
#         test_file_exe=io.BytesIO(b'Test File exe'),
#         test_file_exe_name='test_file_3.exe'
#     )

#     if os.path.exists(f'{base_path}/test'):
#         shutil.rmtree(f'{base_path}/test')


def test_download_file_no_guid(test_client, auth_headers):
    get_resp = test_client.get(
        f'/document-manager', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['error']['status'] == 400
    assert get_data['error']['message'] is not ''


def test_download_file_no_doc_with_guid(test_client, auth_headers):
    get_resp = test_client.get(
        f'/document-manager/1234', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 400
    assert get_data['error']['status'] == 400
    assert get_data['error']['message'] is not ''
