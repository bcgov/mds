import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.permits.permit.models.permit import Permit
from app.extensions import db
from tests.constants import DUMMY_USER_KWARGS


@pytest.fixture(scope="function")
def setup_info(test_client):
    mine_1 = Mine.create_mine('1234567', 'TestMine', True, 'SW', DUMMY_USER_KWARGS)
    mine_2 = Mine.create_mine('7654321', 'TestingMine', True, 'NW', DUMMY_USER_KWARGS)
    mine_1.save()
    mine_2.save()

    permit = Permit.create_mine_permit(mine_2, 'mx-test-231', 'O', DUMMY_USER_KWARGS)
    permit.save()

    MINE_1_GUID = str(mine_1.mine_guid)
    MINE_2_GUID = str(mine_2.mine_guid)
    MINE_2_PERMIT_GUID = str(permit.permit_guid)

    yield dict(
        mine_1_guid=MINE_1_GUID, mine_2_guid=MINE_2_GUID, mine_2_permit_guid=MINE_2_PERMIT_GUID)

    db.session.delete(permit)
    db.session.commit()
    db.session.delete(mine_1)
    db.session.commit()
    db.session.delete(mine_2)
    db.session.commit()


# GET
def test_get_permit_not_found(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/permits/' + setup_info.get('mine_1_guid'), headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'error': {'status': 404, 'message': 'Permit not found'}}
    assert get_resp.status_code == 404


def test_get_permit(test_client, setup_info, auth_headers):
    get_resp = test_client.get(
        '/permits/' + setup_info.get('mine_2_permit_guid'),
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['permit_guid'] == setup_info.get('mine_2_permit_guid')
    assert get_resp.status_code == 200


#Create
def test_create_permit(test_client, setup_info, auth_headers):
    PERMIT_NO = 'mx-test-999'
    data = {
        'mine_guid': setup_info.get('mine_1_guid'),
        'permit_no': PERMIT_NO,
        'permit_status_code': 'O',
        'received_date': '1999-12-12',
        'issue_date': '1999-12-21',
        'authorization_end_date': '2012-12-02'
    }
    post_resp = test_client.post('/permits', headers=auth_headers['full_auth_header'], data=data)
    post_data = json.loads(post_resp.data.decode())
    raise Exception(post_data)
    assert post_resp.status_code == 200
    assert post_data.get('mine_guid') == setup_info.get('mine_1_guid')
    assert post_data.get('permit_no') == PERMIT_NO
    assert post_data.get('amendments')
    assert len(post_data.get('amendments')) == 1
