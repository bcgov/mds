from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions


# POST
def test_get_standard_permit_conditions_by_notice_of_work_type(test_client, db_session, auth_headers):
    
    data = {
        "standard_permit_condition": {
            "condition": "test",
            "condition_category_code": "GEC",
            "parent_permit_condition_id": None,
            "display_order": 3,
            "condition_type_code": "LIS"
        }
    }
    notice_of_work_type= "SAG"
    post_resp = test_client.post(
        f'/mines/permits/standard-conditions/{notice_of_work_type}',
        headers=auth_headers['full_auth_header'],
        json=data)
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 201, post_resp.response
    
