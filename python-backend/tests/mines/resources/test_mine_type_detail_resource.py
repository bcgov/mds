import json, uuid, pytest

from tests.factories import MineTypeFactory
from tests.status_code_gen import SampleMineCommodityCodes, SampleMineDisturbanceCodes


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_type_detail_invalid_mine_disturbance_code(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})

    test_mine_type_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_disturbance_code': 'ABC'
    }
    post_resp = test_client.post('/mines/mine-types/details',
                                 data=test_mine_type_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Invalid mine_disturbance_code.'
        }
    }


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_type_detail_invalid_mine_commdity_code(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})

    test_mine_type_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_commodity_code': 'ABC'
    }
    post_resp = test_client.post('/mines/mine-types/details',
                                 data=test_mine_type_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {'error': {'status': 400, 'message': 'Error: Invalid mine_commodity_code.'}}


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_disturbance_duplicate(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})
    disturb = SampleMineDisturbanceCodes(mine_type.mine_tenure_type, 1)[0]

    test_mine_type_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_disturbance_code': disturb
    }
    post_resp1 = test_client.post('/mines/mine-types/details',
                                  data=test_mine_type_data,
                                  headers=auth_headers['full_auth_header'])
    post_data1 = json.loads(post_resp1.data.decode())
    assert post_resp1.status_code == 200
    assert post_data1['mine_type_guid'] == str(mine_type.mine_type_guid)
    assert post_data1['mine_disturbance_code'] == disturb

    post_resp2 = test_client.post('/mines/mine-types/details',
                                  data=test_mine_type_data,
                                  headers=auth_headers['full_auth_header'])
    post_data2 = json.loads(post_resp2.data.decode())
    assert post_resp2.status_code == 400


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_commodity_duplicate(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})
    commodity = SampleMineCommodityCodes(mine_type.mine_tenure_type, 1)[0]

    test_mine_type_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_commodity_code': commodity
    }
    post_resp1 = test_client.post('/mines/mine-types/details',
                                  data=test_mine_type_data,
                                  headers=auth_headers['full_auth_header'])
    post_data1 = json.loads(post_resp1.data.decode())
    assert post_resp1.status_code == 200
    assert post_data1['mine_type_guid'] == str(mine_type.mine_type_guid)
    assert post_data1['mine_commodity_code'] == commodity

    post_resp2 = test_client.post('/mines/mine-types/details',
                                  data=test_mine_type_data,
                                  headers=auth_headers['full_auth_header'])
    post_data2 = json.loads(post_resp2.data.decode())
    assert post_resp2.status_code == 400


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_type_detail_invalid_mine_disturbance_code_for_tenure_type(
        test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_tenure_type_code='PLR',
                                mine_type_detail={
                                    'commodities': 0,
                                    'disturbances': 0
                                })

    test_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_disturbance_code': 'CWA'  # CWA is not a valid PLR disturbance
    }
    post_resp = test_client.post('/mines/mine-types/details',
                                 data=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Invalid mine_disturbance_code.'
        }
    }


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_type_detail_invalid_mine_commodity_code_for_tenure_type(
        test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_tenure_type_code='COL',
                                mine_type_detail={
                                    'commodities': 0,
                                    'disturbances': 0
                                })

    test_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_commodity_code': 'AE'  # AE is not a valid COL commodity
    }
    post_resp = test_client.post('/mines/mine-types/details',
                                 data=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {'error': {'status': 400, 'message': 'Error: Invalid mine_commodity_code.'}}


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_post_mine_type_detail_commodity_and_disturbance(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})

    test_data = {
        'mine_type_guid': str(mine_type.mine_type_guid),
        'mine_disturbance_code': SampleMineDisturbanceCodes(mine_type.mine_tenure_type, 1)[0],
        'mine_commodity_code': SampleMineCommodityCodes(mine_type.mine_tenure_type, 1)[0]
    }
    post_resp = test_client.post('/mines/mine-types/details',
                                 data=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data == {
        'error': {
            'status': 400,
            'message': 'Error: Unable to create mine_type_detail with disturbance and commodity.'
        }
    }


# DELETE
@pytest.mark.skip('functionality is in mine-type endpoint')
def test_delete_mine_type_detail_success(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory()
    detail_guid = mine_type.mine_type_detail[0].mine_type_detail_xref_guid

    delete_resp = test_client.delete(f'/mines/mine-types/details/{detail_guid}',
                                     headers=auth_headers['full_auth_header'])
    delete_data = json.loads(delete_resp.data.decode())
    assert delete_resp.status_code == 200
    assert delete_data['mine_type_detail_guid'] == str(detail_guid)


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_delete_mine_type_detail_missing_mine_type_detail_guid(test_client, db_session,
                                                               auth_headers):
    delete_resp = test_client.delete('/mines/mine-types/details/',
                                     headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404


@pytest.mark.skip('functionality is in mine-type endpoint')
def test_delete_mine_type_detail_invalid_mine_type_detail_guid(test_client, db_session,
                                                               auth_headers):
    delete_resp = test_client.delete(f'/mines/mine-types/details/{uuid.uuid4()}',
                                     headers=auth_headers['full_auth_header'])
    delete_data = json.loads(delete_resp.data.decode())
    assert delete_resp.status_code == 400
    assert delete_data == {
        'error': {
            'status': 400,
            'message': 'Error: Invalid mine_type_detail_guid.'
        }
    }
