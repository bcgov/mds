import json

def test_get_all_mine_disturbance_types(test_client, auth_headers):
    get_resp = test_client.get('/mines/disturbance_codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    all_options = [
        {
            'mine_disturbance_code': 'SUR',
            'description': 'Surface',
            'mine_tenure_type_codes': ['COL', 'MIN', 'PLR', 'BCL'],
            'exclusive_ind': False
        },
        {
            'mine_disturbance_code': 'UND',
            'description': 'Underground',
            'mine_tenure_type_codes': ['COL', 'MIN', 'PLR'],
            'exclusive_ind': False
        },
        {
            'mine_disturbance_code': 'CWA',
            'description': 'Coal Wash',
            'mine_tenure_type_codes': ['COL'],
            'exclusive_ind': True
        },
        {
            'mine_disturbance_code': 'MIL',
            'description': 'Mill',
            'mine_tenure_type_codes': ['PLR'],
            'exclusive_ind': True
        }
    ]

    assert get_resp.status_code == 200
    assert get_data == { 'options': all_options }
