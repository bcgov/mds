import json

from tests.factories import ActivityFactory, MineFactory


class TestActivityListResource:
    """GET /activities"""

    def test_get_activities_by_user(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 status code"""
        username = 'test@bceid'
        batch_size = 3
        mine = MineFactory(minimal=True)
        ActivityFactory.create_batch(size=batch_size, mine=mine)
        ActivityFactory.create_batch(size=batch_size, mine=mine, user=username)

        get_resp = test_client.get(
            f'/activities?user={username}',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert get_data['total'] == batch_size
        assert get_data['records'][0]['notification_recipient'] == username
        document = get_data['records'][0]['notification_document']
        assert document['metadata']['mine']['mine_guid'] == str(mine.mine_guid)

    def test_get_activities_by_user_ignores_case(self, test_client, db_session, auth_headers):
        """Should return the correct number of records ignoring the case of the requsted username"""
        username_lower = 'test@bceid'
        username_upper = 'TEST@BCEID'
        batch_size = 2
        mine = MineFactory(minimal=True)
        ActivityFactory.create_batch(size=batch_size, mine=mine)
        ActivityFactory.create_batch(size=batch_size, mine=mine, user=username_lower)
        ActivityFactory.create_batch(size=batch_size, mine=mine, user=username_upper)

        get_resp_lower = test_client.get(
            f'/activities?user={username_lower}',
            headers=auth_headers['full_auth_header'])

        get_resp_upper = test_client.get(
            f'/activities?user={username_upper}',
            headers=auth_headers['full_auth_header'])

        get_data_lower = json.loads(get_resp_lower.data.decode())
        get_data_upper = json.loads(get_resp_upper.data.decode())

        assert len(get_data_lower['records']) == 4
        assert get_data_lower['total'] == 4

        assert len(get_data_upper['records']) == 4
        assert get_data_upper['total'] == 4
