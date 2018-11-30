import json
import io
import filecmp
import os
import pytest
import shutil

@pytest.fixture(scope="function")
def setup_info(test_client):

    return dict(
        mine_guid = '3bc222ec-0f1f-49dd-bf5e-13bddab4725e',
        mine_no = 'BLAH2905',
        base_path = test_client.application.config['UPLOADED_DOCUMENT_DEST'],
        file_upload_1 = (io.BytesIO(b'Test File'), 'test_file_1.pdf'),
        file_upload_2 = (io.BytesIO(b'Test File'), 'test_file_2.docx'),
        file_upload_3 = (io.BytesIO(b'Test File'), 'test_file_3.exe'),
        file_upload_4 = (io.BytesIO(b'Test File'), 'test_file_4.sh'),
    )

def test_happy_path_file_upload(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': setup_info.get('file_upload_1'),
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.pdf'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}') 
    
    assert post_resp.status_code == 200
    assert saved_file

    shutil.rmtree(test_dir_path)

def test_happy_path_file_upload_two_files(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': [setup_info.get('file_upload_2'), setup_info.get('file_upload_1')] ,
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.docx'
    filename2 = post_data['document_manager_guids'][1]+'.pdf'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}')  
    saved_file_2 = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename2}')
    
    assert post_resp.status_code == 200
    assert saved_file
    assert saved_file_2
    assert saved_file is not saved_file_2

    shutil.rmtree(test_dir_path)
    

def test_bad_file_type(test_client, auth_headers, setup_info):
    test_dir = os.mkdir(setup_info.get('base_path') + '/test')
    test_dir_path = setup_info.get('base_path') + '/test'
    
    data = {
        'folder': f'test/mines/{setup_info.get("mine_guid")}/tailings',
        'file': [setup_info.get('file_upload_2'), setup_info.get('file_upload_3'), setup_info.get('file_upload_4')] ,
        'pretty_folder': f'test/mines/{setup_info.get("mine_no")}/tailings',
    }

    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.docx'
    saved_file = open(f'{test_dir_path}/mines/{setup_info.get("mine_guid")}/tailings/{filename}')  
    
    assert len(post_data['errors']) == 2
    assert len(post_data['document_manager_guids']) == 1
    assert saved_file
    
    shutil.rmtree(test_dir_path)
