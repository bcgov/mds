import json
import io
import filecmp
import os
import pytest
import shutil

from unittest import mock

class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

@pytest.fixture(scope="function")
def setup_info(test_client):
    expected_data = {
        "last_inspection": "2018-12-10 18:36",
        "inspector": "IDIR\\TEST",
        "open_orders": 3,
        "overdue_orders": 1,
        "advisories": 3,
        "warnings": 2,
        "section_35_orders": 2
    }

    NRIS_Mock_data = [{
                "assessmentDate": "2018-11-01 13:36",
                "assessmentType": "INSPECTION",
                "assessor": "IDIR\\GRMCLEAN",
                "inspection": {
                    "stops": [
                        {
                            "stopOrders": [
                                {
                                    "orderStatus": "Open",
                                    "orderCompletionDate": "2018-12-10 13:52",
                                    "orderAuthoritySection": "Section 15(4)",
                                }
                            ],
                            "stopAdvisories": [{
                                "advisoryDetail": "test"
                            },{
                                "advisoryDetail": "test"
                            },{
                                "advisoryDetail": "test"
                            }],
                            "stopWarnings": [{
                                "warningDetail": "test"
                            },{
                                "warningDetail": "test"
                            }],
                        }
                    ]
                }
            },{
                "assessmentDate": "2018-12-10 18:36",
                "assessmentType": "INSPECTION",
                "assessor": "IDIR\\TEST",
                "inspection": {
                    "stops": [
                        {
                            "stopOrders": [
                                {
                                    "orderStatus": "Open",
                                    "orderCompletionDate": "2019-01-15 13:52",
                                    "orderAuthoritySection": "Section 15(4)",
                                },
                                {
                                    "orderStatus": "Open",
                                    "orderCompletionDate": "2019-01-14 13:52",
                                    "orderAuthoritySection": "Section 35",
                                }
                            ],
                            "stopAdvisories": [],
                            "stopWarnings": [],
                        }
                    ]
                }
            },{
                "assessmentDate": "2017-12-01 18:36",
                "assessmentType": "INSPECTION",
                "assessor": "IDIR\\TEST",
                "inspection": {
                    "stops": [
                        {
                            "stopOrders": [
                                {
                                    "orderStatus": "Closed",
                                    "orderCompletionDate": "2018-01-15 13:52",
                                    "orderAuthoritySection": "Section 15(4)",
                                },
                                {
                                    "orderStatus": "Closed",
                                    "orderCompletionDate": "2018-01-14 13:52",
                                    "orderAuthoritySection": "Section 35",
                                }
                            ],
                            "stopAdvisories": [{
                                "advisoryDetail": "test"
                            },{
                                "advisoryDetail": "test"
                            },{
                                "advisoryDetail": "test"
                            }],
                            "stopWarnings": [{
                                "warningDetail": "test"
                            },{
                                "warningDetail": "test"
                            },{
                                "warningDetail": "test"
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
        assert get_data['open_orders'] == expected['open_orders']
        assert get_data['overdue_orders'] == expected['overdue_orders']
        assert get_data['advisories'] == expected['advisories']
        assert get_data['warnings'] == expected['warnings']
        assert get_data['section_35_orders'] == expected['section_35_orders']

def test_no_NRIS_Token(test_client, auth_headers, setup_info):

    with mock.patch('requests.get') as nris_data_mock:
        nris_data_mock.side_effect = [MockResponse(None, 400), MockResponse(setup_info.get('NRIS_Mock_data'), 200)]

        get_resp = test_client.get(
            '/mines/compliance/1234567',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        
        assert get_resp.status_code == 400
        assert get_data['error']['message'] is not None

def test_no_NRIS_Data(test_client, auth_headers, setup_info):

    with mock.patch('requests.get') as nris_data_mock:
        nris_data_mock.side_effect = [MockResponse({'access_token':'1234-121241-241241-241'}, 200), MockResponse(None, 400)]

        get_resp = test_client.get(
            '/mines/compliance/1234567',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        
        assert get_resp.status_code == 400
        assert get_data['error']['message'] is not None