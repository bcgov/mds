import json
import io
import filecmp
import os
import pytest
import shutil

@pytest.fixture(scope="function")
def setup_info(test_client):
    base_path = test_client.application.config['UPLOADED_DOCUMENT_DEST']
    
    if os.path.exists(f'{base_path}/test'):
        shutil.rmtree(f'{base_path}/test')

    yield dict(
        mine_guid = '3bc222ec-0f1f-49dd-bf5e-13bddab4725e',
        mine_no = 'BLAH2905',
        base_path = base_path,
        file_upload_1 = (io.BytesIO(b'Test File'), 'test_file_1.pdf'),
        file_upload_2 = (io.BytesIO(b'Test File'), 'test_file_2.docx'),
        file_upload_3 = (io.BytesIO(b'Test File'), 'test_file_3.exe'),
        file_upload_4 = (io.BytesIO(b'Test File'), 'test_file_4.sh'),
    )

    if os.path.exists(f'{base_path}/test'):
        shutil.rmtree(f'{base_path}/test')

def test_happy_path_file_upload(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': setup_info.get('file_upload_1'),
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.pdf'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}') 

    assert saved_file

def test_happy_path_file_upload_two_files(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': [setup_info.get('file_upload_2'), setup_info.get('file_upload_1')] ,
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    
    assert post_resp.status_code == 200
    
    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.docx'
    filename2 = post_data['document_manager_guids'][1]+'.pdf'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}')  
    saved_file_2 = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename2}')
    
    assert saved_file
    assert saved_file_2
    assert saved_file is not saved_file_2

def test_bad_file_type(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': [setup_info.get('file_upload_2'), setup_info.get('file_upload_3'), setup_info.get('file_upload_4')] ,
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }

    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.docx'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}')
    
    assert len(post_data['errors']) == 2
    assert len(post_data['document_manager_guids']) == 1
    assert saved_file

def test_download_file(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': setup_info.get('file_upload_1'),
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    
    assert post_resp.status_code == 200

    post_data = json.loads(post_resp.data.decode())

    assert len(post_data['document_manager_guids']) == 1
    
    filename = post_data['document_manager_guids'][0]+'.pdf'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}', 'rb') 

    get_resp = test_client.get(f'/document-manager/{post_data["document_manager_guids"][0]}', headers=auth_headers['full_auth_header'])
    saved_file.seek(0)

    assert get_resp.data == saved_file.read()

def test_download_file_no_guid(test_client, auth_headers, setup_info):
    
    get_resp = test_client.get(f'/document-manager', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code ==200
    assert get_data['error']['status'] == 401
    assert get_data['error']['message'] is not ''

def test_download_file_no_doc_with_guid(test_client, auth_headers, setup_info):
    
    get_resp = test_client.get(f'/document-manager/1234', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code ==200
    assert get_data['error']['status'] == 401
    assert get_data['error']['message'] is not ''
