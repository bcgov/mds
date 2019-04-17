import json

from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode


def test_get_all_mine_disturbance_types(test_client, db_session, auth_headers):
    disturbances = MineDisturbanceCode.query.filter_by(active_ind=True).all()
    disturbance_codes = map(lambda c: c.mine_disturbance_code, disturbances)
    discriptions = map(lambda c: c.description, disturbances)

    get_resp = test_client.get('/mines/disturbance-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    options = get_data['options']
    assert get_resp.status_code == 200
    assert len(options) == len(disturbances)
    assert all(option['mine_disturbance_code'] in disturbance_codes for option in options)
    assert all(option['description'] in discriptions for option in options)
