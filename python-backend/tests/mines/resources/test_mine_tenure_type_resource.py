import json

from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode


def test_get_all_mine_tenure_type_codes(test_client, db_session, auth_headers):
    type_codes = MineTenureTypeCode.query.all()
    all_options = list(
        map(lambda x: {
            'value': x.mine_tenure_type_code,
            'label': x.description
        }, type_codes))

    get_resp = test_client.get(
        '/mines/mine-tenure-type-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data == {'options': all_options}
