from tests.factories import DamFactory
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
