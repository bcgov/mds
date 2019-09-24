import json, uuid, pytest

from tests.factories import MineFactory, MineTypeFactory
from tests.status_code_gen import SampleMineCommodityCodes, SampleMineDisturbanceCodes


# POST
def test_post_mine_type_success_tenure_only(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {'mine_tenure_type_code': 'MIN'}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['mine_type_guid'] != None
    assert post_data['mine_tenure_type_code'] == test_data['mine_tenure_type_code']


def test_post_many_commodity_success(test_client, db_session, auth_headers):
    mine_type = MineTypeFactory(mine_tenure_type_code='MIN',
                                mine_type_detail={
                                    'commodities': 0,
                                    'disturbances': 0
                                })
    num_commodities = 10
    mine = MineFactory(mine_type=None)
    print(mine_type.mine_tenure_type.mine_commodity_codes)
    commodities = SampleMineCommodityCodes(mine_type.mine_tenure_type, num_commodities)

    test_data = {'mine_tenure_type_code': 'MIN', 'mine_commodity_code': commodities}
    post_resp = test_client.post(f'/mines/{mine.mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert len(post_data['mine_type_detail']) == num_commodities
    assert all(mtd['mine_commodity_code'] is not None for mtd in post_data['mine_type_detail'])


def test_post_mine_disturbance_success(test_client, db_session, auth_headers):

    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})
    disturb = SampleMineDisturbanceCodes(mine_type.mine_tenure_type, 1)
    mine = MineFactory(mine_type=None)

    test_data = {
        'mine_tenure_type_code': mine_type.mine_tenure_type_code,
        'mine_disturbance_code': disturb
    }
    post_resp = test_client.post(f'/mines/{mine.mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 200, post_resp.response
    assert post_data['mine_tenure_type_code'] == test_data['mine_tenure_type_code']
    assert post_data['mine_type_detail'][0]['mine_disturbance_code'] == disturb[0]
    assert post_data['mine_type_detail'][0]['mine_commodity_code'] == None


def test_post_mine_type_missing_mine_tenure_type_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_type_detail_invalid_mine_disturbance_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_mine_type_data = {'mine_tenure_type_code': 'MIN', 'mine_disturbance_code': ['ABC']}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_mine_type_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data['message'] is not None


def test_post_mine_type_detail_invalid_mine_commdity_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_mine_type_data = {'mine_tenure_type_code': 'MIN', 'mine_commodity_code': ['ZZZ']}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_mine_type_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data['message'] is not None


def test_post_mine_type_detail_invalid_mine_commdity_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid
    mine_type = MineTypeFactory(mine_tenure_type_code='MIN',
                                mine_type_detail={
                                    'commodities': 0,
                                    'disturbances': 0
                                })
    #make mine_type with cole but commodity only valid with Mineral
    test_mine_type_data = {
        'mine_tenure_type_code': 'COL',
        'mine_commodity_code': SampleMineCommodityCodes(mine_type.mine_tenure_type, 1)[0]
    }
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_mine_type_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data['message'] is not None


@pytest.mark.skip(reason='Foreign Key constraint not enforced for unknown reason')
def test_post_mine_type_invalid_mine_tenure_type_code(test_client, db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    test_data = {'mine_tenure_type_code': 'zzz'}
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400


def test_post_mine_type_duplicate(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid

    test_data = {'mine_tenure_type_code': 'MIN'}
    post_resp1 = test_client.post(f'/mines/{mine_guid}/mine-types',
                                  json=test_data,
                                  headers=auth_headers['full_auth_header'])
    post_data1 = json.loads(post_resp1.data.decode())
    assert post_resp1.status_code == 200
    assert post_data1['mine_type_guid'] != None
    assert post_data1['mine_guid'] == str(mine_guid)

    post_resp2 = test_client.post(f'/mines/{mine_guid}/mine-types',
                                  json=test_data,
                                  headers=auth_headers['full_auth_header'])
    post_data2 = json.loads(post_resp2.data.decode())
    assert post_resp2.status_code == 400


def test_post_mine_type_detail_commodity_and_disturbance(test_client, db_session, auth_headers):
    mine_guid = MineFactory(mine_type=None).mine_guid
    mine_type = MineTypeFactory(mine_type_detail={'commodities': 0, 'disturbances': 0})

    test_data = {
        'mine_tenure_type_code': 'MIN',
        'mine_disturbance_code': SampleMineDisturbanceCodes(mine_type.mine_tenure_type, 1)[0],
        'mine_commodity_code': SampleMineCommodityCodes(mine_type.mine_tenure_type, 1)[0]
    }
    post_resp = test_client.post(f'/mines/{mine_guid}/mine-types',
                                 json=test_data,
                                 headers=auth_headers['full_auth_header'])
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 400
    assert post_data['message'] is not None


# DELETE
def test_delete_mine_type_success(test_client, db_session, auth_headers):
    mine = MineFactory()
    type_guid = mine.mine_type[0].mine_type_guid

    delete_resp = test_client.delete(f'/mines/{mine.mine_guid}/mine-types/{type_guid}',
                                     headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204


def test_delete_mine_type_invalid_mine_type_guid(test_client, db_session, auth_headers):
    mine = MineFactory()
    delete_resp = test_client.delete(f'/mines/{mine.mine_guid}/mine-types/{uuid.uuid4()}',
                                     headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404
