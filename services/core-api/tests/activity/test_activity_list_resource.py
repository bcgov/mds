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
