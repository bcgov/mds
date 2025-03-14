from tests.factories import DamFactory, MineTailingsStorageFacilityFactory
import json

"""GET/PATCH /dams/{dam_guid}"""

def test_get_dam(test_client, db_session, auth_headers):
    """Should return a dam and a 200 status"""
    """GET /dams/{dam_guid}"""

    dam = DamFactory()

    get_resp = test_client.get(
        f"/dams/{dam.dam_guid}",
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['dam_guid'] == str(dam.dam_guid)

# PATCH
def test_patch_dam(test_client, db_session, auth_headers):
    """Should return updated Dam and a 200 status"""

    dam = DamFactory()
    dam_guid = dam.dam_guid

    update_dam = dam
    update_dam.dam_name = "Updated Dam Name"

    data = {'dam_name': update_dam.dam_name}

    patch_resp = test_client.patch(
        f'/dams/{dam_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    patch_data = json.loads(patch_resp.data.decode())

    assert patch_resp.status_code == 200
    assert patch_data['dam_guid'] == str(dam_guid)
    assert patch_data['dam_name'] == "Updated Dam Name"
    assert patch_data['dam_name'] != 'Dam Name'

def test_dam_history(test_client, db_session, auth_headers):
    tsf = MineTailingsStorageFacilityFactory()

    new_dam_data = {
        'mine_tailings_storage_facility_guid': str(tsf.mine_tailings_storage_facility_guid),
        'dam_type': 'dam',
        'dam_name': "New Dam",
        'latitude': "48.2",
        'longitude': "-113.8",
        'operating_status': 'construction',
        'consequence_classification': 'LOW',
        'permitted_dam_crest_elevation': '1',
        'current_dam_height': '2',
        'current_elevation': '3',
        'max_pond_elevation': '4',
        'min_freeboard_required': '5'
    }

    post_resp = test_client.post(
        '/dams',
        headers=auth_headers['full_auth_header'],
        json=new_dam_data
    )
    post_data = json.loads(post_resp.data.decode())
    dam_guid = post_data['dam_guid']

    initial_changeset = post_data['history'][0]['changeset']

    for change in initial_changeset:
         field_name = change['field_name']
         assert change['from'] == None
         new_value = post_data.get(field_name, None)

         # don't check fields not returned by the get request
         if new_value is not None and field_name not in ['create_timestamp', 'update_timestamp']:
            # remove trailing 0s for equality checks on numbers
            assert change['to'].rstrip("0") == str(new_value).rstrip("0")

    new_name = "Brand New Name"
    data = {'dam_name': new_name}

    patch_resp = test_client.patch(
        f'/dams/{dam_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    patch_data = json.loads(patch_resp.data.decode())

    new_changeset = patch_data['history'][1]['changeset']
    name_change = next(c for c in new_changeset if c['field_name'] == 'dam_name')
    assert name_change['from'] == post_data.get('dam_name', None)
    assert name_change['to'] == new_name

    
