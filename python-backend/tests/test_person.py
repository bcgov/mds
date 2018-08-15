import json
from .constants import *

def test_get_persons(test_client_with_data):
   get_resp = test_client_with_data.get('/persons')
   get_data = json.loads(get_resp.data.decode())
   assert get_resp.status_code == 200

def test_get_person(test_client_with_data):
   get_resp = test_client_with_data.get('/person/' + str(TEST_PERSON_GUID))
   get_data = json.loads(get_resp.data.decode())
   assert get_data['person_guid'] == str(TEST_PERSON_GUID)
   assert get_resp.status_code == 200

def test_get_manager(test_client_with_data):
   get_resp = test_client_with_data.get('/manager/' + str(TEST_MANAGER_GUID))
   get_data = json.loads(get_resp.data.decode())
   print(get_data)
   assert get_data['mgr_appointment_guid'] == str(TEST_MANAGER_GUID)
   assert get_resp.status_code == 200