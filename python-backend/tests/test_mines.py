import json

def test_mines(test_client):
    assert True == True

def test_create_mine(test_client):
   test_mine_data = {"name": "test_create_mine"}
   post_resp = test_client.post('/mine', data=test_mine_data)
   get_resp = test_client.get('/mines')
   get_data = json.loads(get_resp.data.decode())
   post_data = json.loads(post_resp.data.decode())
   assert post_data['mine_name'] == test_mine_data['name']
   assert get_data['mines'][0]['guid'] == post_data['mine_guid']
   assert get_resp.status_code == 200
   assert post_resp.status_code == 200

def test_get_mines(test_client_with_data):
    get_resp = test_client_with_data.get('/mines')
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200

def test_get_mine(test_client_with_data):
    get_resp = test_client_with_data.get('/mine/BLAH000')
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_detail'][0]['mine_no'] == 'BLAH000'
    assert get_resp.status_code == 200

def test_put_mine_tenure(test_client_with_data):
    test_tenure_data = {'tenure_number_id': '1234567'}
    put_resp = test_client_with_data.put('/mine/BLAH000', data=test_tenure_data)
    put_data = json.loads(put_resp.data.decode())
    print(put_data)
    assert put_data['mineral_tenure_xref'][0]['tenure_number_id'] == test_tenure_data['tenure_number_id']
    assert put_resp.status_code == 200
