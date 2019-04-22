import json
from tests.factories import MineFactory, SubscriptionFactory
from app.api.utils.include.user_info import DUMMY_AUTH_CLAIMS

user_name = DUMMY_AUTH_CLAIMS["preferred_username"]


#GET empty
def test_get_no_favorites(test_client, db_session, auth_headers):
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['view_only_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {'mines': []}
    assert get_resp.status_code == 200


#POST
def test_post_a_favorite(test_client, db_session, auth_headers):
    mine1_guid = MineFactory().mine_guid
    get_resp = test_client.post(
        '/mines/' + str(mine1_guid) + '/subscribe', headers=auth_headers['view_only_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data == {"mine_guid": str(mine1_guid)}
    assert get_resp.status_code == 200


# GET one
def test_get_favorites(test_client, db_session, auth_headers):
    batch_size = 7
    SubscriptionFactory.create_batch(size=batch_size)
    mine = MineFactory()
    mine_name = mine.mine_name
    SubscriptionFactory(user_name=user_name, mine=mine)
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['view_only_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data["mines"][0]["mine_name"] == mine_name
    assert get_resp.status_code == 200


# DELETE
def test_delete_a_favorite(test_client, db_session, auth_headers):
    mine = MineFactory()
    mine_guid = str(mine.mine_guid)
    SubscriptionFactory(user_name=user_name, mine=mine)
    # Assert that delete method sends correct response
    get_resp = test_client.delete(
        '/mines/' + mine_guid + '/subscribe', headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 204, get_resp.response
    # Assert that delete was done correctly
    get_resp = test_client.get('/mines/subscribe', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data == {'mines': []}
