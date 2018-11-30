import json
import io
import filecmp
import os

def test_happy_path_file_upload(test_client, auth_headers, tmpdir_factory):
    mine_guid = '3bc222ec-0f1f-49dd-bf5e-13bddab4725e'
    filename = 'test_file.pdf'
    mine_no = 'BLAH2905'
    base_path = os.environ.get('UPLOADED_DOCUMENT_DEST', '/app/document_uploads')
    file_upload = (io.BytesIO(b'Test File'), filename)
    test_dir = tmpdir_factory.mktemp('mines')
    test_dir_path = str(test_dir).split('/')
    data = {
        'folder': f'{test_dir_path[-1]}/{mine_guid}/tailings',
        'file': file_upload,
        'pretty_folder': f'mines/{mine_no}/tailings',
    }
    
    post_resp = test_client.post('/document-manager', data=data, headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    filename = post_data['document_manager_guids'][0]+'.pdf'
    saved_file = open(f'{base_path}/{test_dir_path[-1]}/{mine_guid}/tailings/{filename}') 
    
    assert post_resp.status_code == 200
