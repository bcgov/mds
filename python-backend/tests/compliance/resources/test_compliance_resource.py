import json
import io
import filecmp
import os
import pytest
import requests

from datetime import datetime
from dateutil.relativedelta import relativedelta
from unittest import mock

def get_date_one_month_ahead():
    date = datetime.now() + relativedelta(months=1)
    return date.strftime('%Y-%m-%d %H:%M')
class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data
    def raise_for_status(self):
        return

@pytest.fixture(scope='function')
def setup_info(test_client):
    date = get_date_one_month_ahead()

    expected_data = {
        'last_inspection': '2018-12-10 18:36',
        'inspector': 'TEST',
        'num_open_orders': 3,
        'num_overdue_orders': 1,
        'advisories': 3,
        'warnings': 2,
        'section_35_orders': 2,
        'open_orders': [{
            'order_no': '162409-1',
            'code_violation': '1.1.2',
            'report_no': 162409,
            'inspector': 'TEST',
            'due_date': date,
            'overdue': False,

        },{
            'order_no': '162409-2',
            'code_violation': '2.4.2',
            'report_no': 162409,
            'inspector': 'TEST',
            'due_date': date,
            'overdue': False,

        },{
            'order_no': '100018-1',
            'code_violation': 'C.8 (a) (i)',
            'report_no': 100018,
            'inspector': 'TEST',
            'due_date': '2018-12-10 13:52',
            'overdue': True,

        },]
    }

    NRIS_Mock_data = [{
                'assessmentId': 100018,
                'assessmentDate': '2018-11-01 13:36',
                'assessmentType': 'INSPECTION',
                'assessor': 'IDIR\\TEST',
                'inspection': {
                    'stops': [
                        {
                            'stopOrders': [
                                {
                                    'orderStatus': 'Open',
                                    'orderCompletionDate': '2018-12-10 13:52',
                                    'orderAuthoritySection': 'Section 15(4)',
                                    'orderPermits': [
                                        {
                                            "permitSectionNumber": "C.8 (a) (i)",
                                        }
                                    ],
                                }
                            ],
                            'stopAdvisories': [{
                                'advisoryDetail': 'test'
                            },{
                                'advisoryDetail': 'test'
                            },{
                                'advisoryDetail': 'test'
                            }],
                            'stopWarnings': [{
                                'warningDetail': 'test'
                            },{
                                'warningDetail': 'test'
                            }],
                        }
                    ]
                }
            },{
                'assessmentId': 162409,
                'assessmentDate': '2018-12-10 18:36',
                'assessmentType': 'INSPECTION',
                'assessor': 'IDIR\\TEST',
                'inspection': {
                    'stops': [
                        {
                            'stopOrders': [
                                {
                                    'orderStatus': 'Open',
                                    'orderCompletionDate': date,
                                    'orderAuthoritySection': 'Section 15(4)',
                                    "orderLegislations": [
                                        {
                                            "section": "1.1.2",
                                        }
                                    ],
                                },
                                {
                                    'orderStatus': 'Open',
                                    'orderCompletionDate': date,
                                    'orderAuthoritySection': 'Section 35',
                                    "orderLegislations": [
                                        {
                                            "section": "2.4.2",
                                        }
                                    ],
                                }
                            ],
                            'stopAdvisories': [],
                            'stopWarnings': [],
                        }
                    ]
                }
            },{
                'assessmentId': 90519,
                'assessmentDate': '2017-12-01 18:36',
                'assessmentType': 'INSPECTION',
                'assessor': 'IDIR\\TEST',
                'inspection': {
                    'stops': [
                        {
                            'stopOrders': [
                                {
                                    'orderStatus': 'Closed',
                                    'orderCompletionDate': '2018-01-15 13:52',
                                    'orderAuthoritySection': 'Section 15(4)',
                                },
                                {
                                    'orderStatus': 'Closed',
                                    'orderCompletionDate': '2018-01-14 13:52',
                                    'orderAuthoritySection': 'Section 35',
                                }
                            ],
                            'stopAdvisories': [{
                                'advisoryDetail': 'test'
                            },{
                                'advisoryDetail': 'test'
                            },{
                                'advisoryDetail': 'test'
                            }],
                            'stopWarnings': [{
                                'warningDetail': 'test'
                            },{
                                'warningDetail': 'test'
                            },{
                                'warningDetail': 'test'
                            }],
                        }
                    ]
                }

            }]

    yield dict(NRIS_Mock_data=NRIS_Mock_data, expected_data=expected_data)


def test_happy_get_from_NRIS(test_client, auth_headers, setup_info):

    with mock.patch('requests.get') as nris_data_mock:

        nris_data_mock.side_effect = [MockResponse({'access_token':'1234-121241-241241-241'}, 200), MockResponse(setup_info.get('NRIS_Mock_data'), 200)]
        
        get_resp = test_client.get(
            '/mines/compliance/1234567',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        expected = setup_info.get('expected_data')

        assert get_resp.status_code == 200
        assert get_data['last_inspection'] == expected['last_inspection']
        assert get_data['inspector'] == expected['inspector']
        assert get_data['num_open_orders'] == expected['num_open_orders']
        assert get_data['num_overdue_orders'] == expected['num_overdue_orders']
        assert get_data['advisories'] == expected['advisories']
        assert get_data['warnings'] == expected['warnings']
        assert get_data['section_35_orders'] == expected['section_35_orders']
        pairs = zip(get_data['open_orders'], expected['open_orders'])
        assert any(x != y for x, y in pairs)

def test_no_NRIS_Token(test_client, auth_headers, setup_info):

    with mock.patch('requests.get') as nris_data_mock:
        nris_data_mock.side_effect = [requests.HTTPError(response=MockResponse(None, 500)), MockResponse(setup_info.get('NRIS_Mock_data'), 200)]

        get_resp = test_client.get(
            '/mines/compliance/1234567',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        
        assert get_resp.status_code == 500
        assert get_data['error']['message'] is not None

def test_no_NRIS_Data(test_client, auth_headers, setup_info):

    with mock.patch('requests.get') as nris_data_mock:
        nris_data_mock.side_effect = [MockResponse({'access_token':'1234-121241-241241-241'}, 200), requests.HTTPError(response=MockResponse(None, 500))]

        get_resp = test_client.get(
            '/mines/compliance/1234567',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        
        assert get_resp.status_code == 500
        assert get_data['error']['message'] is not None