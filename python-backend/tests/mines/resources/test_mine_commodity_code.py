import json

from tests.constants import (
    TEST_MINE_TYPE_GUID,
    TEST_MINE_COMMODITY_CODES,
    TEST_MINE_COMMODITY_DESCRIPTIONS
)


def test_get_all_mine_commodity_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/commodity_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = [
        {
            'mine_commodity_code': 'TO',
            'description': 'Thermal Coal',
            'mine_tenure_type_codes': ['COL'],
            'exclusive_ind': True
        },
        {
            'mine_commodity_code': 'MC',
            'description': 'Metallurgic',
            'mine_tenure_type_codes': ['COL'],
            'exclusive_ind': True
        },
        {
            'mine_commodity_code': 'CG',
            'description': 'Construction Aggregate',
            'mine_tenure_type_codes': ['BCL'],
            'exclusive_ind': False
        },
        {
            'mine_commodity_code': 'SA',
            'description': 'Sand and Gravel',
            'mine_tenure_type_codes': ['BCL'],
            'exclusive_ind': False
        },
        {
            'mine_commodity_code': 'AE',
            'description': 'Agate',
            'mine_tenure_type_codes': ['MIN', 'PLR'],
            'exclusive_ind': False
        },
        {
            'mine_commodity_code': 'AL',
            'description': 'Aluminum',
            'mine_tenure_type_codes': ['MIN', 'PLR'],
            'exclusive_ind': False
        }
    ]

    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }
