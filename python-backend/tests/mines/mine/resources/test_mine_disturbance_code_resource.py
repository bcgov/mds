import json

from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode


def test_get_all_mine_disturbance_types(test_client, db_session, auth_headers):
    disturbances = MineDisturbanceCode.query.filter_by(active_ind=True).all()
    disturbance_codes = map(lambda c: c.mine_disturbance_code, disturbances)
    discriptions = map(lambda c: c.description, disturbances)

    get_resp = test_client.get('/mines/disturbance-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    records = get_data['records']
    assert get_resp.status_code == 200
    assert len(records) == len(disturbances)
    assert all(record['mine_disturbance_code'] in disturbance_codes for record in records)
    assert all(record['description'] in discriptions for record in records)
