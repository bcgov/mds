import json
from tests.factories import PermitConditionTagFactory

# POST
def test_create_permit_conditions_tag(test_client, db_session, auth_headers):
    
    data = {
         "description": "test tag",
    }
    post_resp = test_client.post(
         '/mines/permits/condition-tags',
         headers=auth_headers['full_auth_header'],
         json=data)
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 201, post_resp.response

# DELETE
def test_delete_permit_condition_tag(test_client, db_session, auth_headers):
    tag = PermitConditionTagFactory()

    delete_resp = test_client.delete(
         f'/mines/permits/condition-tags/{tag.permit_condition_tag_guid}',
         headers=auth_headers['full_auth_header'])

    assert delete_resp.status_code == 204
    assert tag.deleted_ind == True

# PUT
def test_update_permit_condition_tag(test_client, db_session, auth_headers):
    tag = PermitConditionTagFactory()

    data = {
        "description": "updated description",
        "permit_condition_tag_guid": str(tag.permit_condition_tag_guid),
    }

    put_resp = test_client.put(
          f'/mines/permits/condition-tags/{tag.permit_condition_tag_guid}',
         headers=auth_headers['full_auth_header'],
         json=data)

    assert put_resp.status_code == 200
    assert "permit_condition_tag_guid" in put_resp.json
    assert put_resp.json['description'] == "updated description"