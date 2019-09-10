import json

from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode


def test_get_all_mine_commodity_types(test_client, db_session, auth_headers):
    commodities = MineCommodityCode.query.filter_by(active_ind=True).all()
    commodity_codes = map(lambda c: c.mine_commodity_code, commodities)
    discriptions = map(lambda c: c.description, commodities)

    get_resp = test_client.get('/mines/commodity-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    records = get_data['records']
    assert get_resp.status_code == 200
    assert len(records) == len(commodities)
    assert all(record['mine_commodity_code'] in commodity_codes for record in records)
    assert all(record['description'] in discriptions for record in records)

