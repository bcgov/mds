import json
import io
import filecmp
import os
import pytest
import requests

from datetime import datetime
from dateutil.relativedelta import relativedelta
from unittest import mock

from app.extensions import cache
from app.api.constants import NRIS_TOKEN
from tests.factories import MineFactory

def get_date_one_month_ahead():
    date = datetime.now() + relativedelta(months=1)
    return date.strftime('%Y-%m-%dT%H:%M:%S')
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
        'last_inspection': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        'last_inspector': "APOOLEY",
        'num_open_orders': 0,
        'num_overdue_orders': 0,
        #'section_35_orders': 0, no aggregate, FE filters will show where violation = 35
        'all_time': {
            'num_inspections': 0,
            'num_advisories': 0,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'last_12_months': {
            'num_inspections': 0,
            'num_advisories': 3,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'current_fiscal': {
            'num_inspections': 0,
            'num_advisories': 0,
            'num_warnings': 0,
            'num_requests': 0,
        },
        'orders': [{
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

    NRIS_Mock_data = {
    "records": [
        {
            "external_id": 102271,
            "inspection_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "completed_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "inspection_status_code": "Complete",
            "inspection_type_code": "Health and Safety",
            "inspection_report_sent_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "business_area": "EMPR",
            "mine_no": "0900002",
            "inspector_idir": "IDIR\\APOOLEY",
            "inspection_introduction": "<p>Bullmoose Mine has been permanently closed since 2002. The purpose of the inspection was to accompany geotechnical inspectors Victor Marques and Jennifer Brash. Environmental sampling and upkeep activities are carried out by Teck Resources. No orders related to health and safety resulted from this inspection,</p>",
            "inspection_preamble": None,
            "inspection_closing": None,
            "officer_notes": None,
            "documents": [
                {
                    "external_id": 143278,
                    "document_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    "document_type": "Report",
                    "file_name": "EMPR_InspectionReport_102271.pdf",
                    "comment": "INSPECTION Report"
                },
                {
                    "external_id": 143302,
                    "document_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    "document_type": "Report",
                    "file_name": "EMPR_InspectionReport_102271.docx",
                    "comment": "INSPECTION Report"
                },
                {
                    "external_id": 147238,
                    "document_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    "document_type": "Mine Manager Response",
                    "file_name": "EMPR_InspectionReport_102271 - Response.pdf",
                    "comment": "Manager response"
                }
            ],
            "inspected_locations": [
                {
                    "inspected_location_type": "stop",
                    "location": {
                        "description": "Former tailings pond, settling ponds",
                        "notes": None,
                        "latitude": None,
                        "longitude": None,
                        "utm_easting": None,
                        "utm_northing": None,
                        "zone_number": None,
                        "zone_letter": None
                    },
                    "documents": [],
                    "advisory_details": [],
                    "request_details": [],
                    "stop_details": [],
                    "warning_details": []
                }
            ]
        },
        {
            "external_id": 102585,
            "inspection_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "completed_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "inspection_status_code": "Complete",
            "inspection_type_code": "Geotechnical",
            "inspection_report_sent_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            "business_area": "EMPR",
            "mine_no": "0900002",
            "inspector_idir": "IDIR\\JBRASH",
            "inspection_introduction": None,
            "inspection_preamble": None,
            "inspection_closing": None,
            "officer_notes": None,
            "documents": [
                {
                    "external_id": 145110,
                    "document_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    "document_type": "Final Report",
                    "file_name": "2018 09 25_Bullmoose_EMPR Geotechnical Inspection.pdf",
                    "comment": "Inspection Report"
                },
                {
                    "external_id": 147662,
                    "document_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                    "document_type": "Mine Manager Response",
                    "file_name": "2018 10 10 Response to the 2018 09 25 Geotechnical Inspection.pdf",
                    "comment": "MM response"
                }
            ],
            "inspected_locations": [
                {
                    "inspected_location_type": "stop",
                    "location": {
                        "description": "Sediment Pond 2",
                        "notes": None,
                        "latitude": None,
                        "longitude": None,
                        "utm_easting": None,
                        "utm_northing": None,
                        "zone_number": None,
                        "zone_letter": None
                    },
                    "documents": [],
                    "advisory_details": [
                        {
                            "detail": "Advisory 1: \nPlease submit the 2018 Sediment Ponds OMS manual, incorporating the updates recommended in the 2017 DSI, to the Chief Inspector upon completion in Q3 2018."
                        },
                        {
                            "detail": "Advisory 2: \nPlease submit the Sediment Pond 2 spillway design to EMPR upon completion."
                        }
                    ],
                    "request_details": [],
                    "stop_details": [],
                    "warning_details": []
                },
                {
                    "inspected_location_type": "stop",
                    "location": {
                        "description": "Sediment Pond 3",
                        "notes": None,
                        "latitude": None,
                        "longitude": None,
                        "utm_easting": None,
                        "utm_northing": None,
                        "zone_number": None,
                        "zone_letter": None
                    },
                    "documents": [],
                    "advisory_details": [
                        {
                            "detail": "Advisory 3: \nThe crest of Sediment Pond 3 should be graded such that ponding of water is eliminated."
                        }
                    ],
                    "request_details": [
                        {
                            "detail": "nformation Request 1: \nPlease inform EMPR of the results of the SP3 spillway flooding assessment (DSI recommendation SP-2017-03), upon completion in Q3 2018.",
                            "response": "As part of looking at long term erosion protection issues related to Sediment Pond 3 spillway,\nKCB presented Teck with an options review. As part of this review, it was concluded that if a\n200 yr return period flood of West Bullmoose Creek were to occur, there is risk that the water\nlevel in the creek would be high enough to flow through the spillway and into Sediment Pond 3.\nHowever, neither the resulting increase in pond level, nor the decrease in storage capacity of\nthe facility would represent a risk to the dam structure. KCB believe the actual pond sediments\nare some distance from the inlet of the spillway and would be in a relatively ?still? area of the\npond (as it is dead ended) so the potential for erosion of the disturbed sediments back into the\ncreek are considered minimal.",
                            "respond_date": None
                        }
                    ],
                    "stop_details": [
                        {
                            "detail": "Order 1 (Inspection of Mines)\nIssued Pursuant To: Mines Act Section 15(4)\n\nObservation of Contravention:\nRiprap installed to protect the toe of Sediment Pond 3 dam from creek erosion appeared damaged at the time of inspection. The 2017 DSI recommends that the erosion be repaired to protect against future recurrence (SP-2012-01), with a target deadline of Q3 2018.    \n\nRemedial Action/Results To Be Obtained:\nThe Mine shall complete repairs of the erosion protection at the toe of the SP3 dam, in accordance with the requirements of the Engineer of Record.  Pursuant to Code clause 10.5.1, the Mine shall submit to the Chief Inspector as-built documentation for the Sediment Pond 3 erosion protection and shall ensure that the Engineer of Record certifies the construction.\n\nRectify By/Completion Date: 2018-12-31",
                            "stop_type": "Inspection Mines",
                            "response_status": "Accepted",
                            "stop_status": "Closed",
                            "observation": "Order 1 (Inspection of Mines)\nIssued Pursuant To: Mines Act Section 15(4)\n\nObservation of Contravention:\nRiprap installed to protect the toe of Sediment Pond 3 dam from creek erosion appeared damaged at the time of inspection. The 2017 DSI recommends that the erosion be repaired to protect against future recurrence (SP-2012-01), with a target deadline of Q3 2018.    \n\nRemedial Action/Results To Be Obtained:\nThe Mine shall complete repairs of the erosion protection at the toe of the SP3 dam, in accordance with the requirements of the Engineer of Record.  Pursuant to Code clause 10.5.1, the Mine shall submit to the Chief Inspector as-built documentation for the Sediment Pond 3 erosion protection and shall ensure that the Engineer of Record certifies the construction.\n\nRectify By/Completion Date: 2018-12-31",
                            "response": "as-built docs received and filed.  MM response:\n\"The observed contravention is incorrect as stated. The riprap observed is at East end of the\ndam not the riprap that was referred to in SP-2012-01 in the 2017 DSI.\nThe riprap observed that appeared damaged was riprap that was installed in 2015. The Certified\nas-built report for this riprap entitled ?Bullmoose SP3 Erosion Repair Construction and\nEnvironmental Monitoring Summary Report? dated December 2015 is being submitted to EMPR\nin a separate submission using our Secure File Transfer system due to the large size of the\nreport. Section 5.3 of the report describes modifications that were made to avoid disturbing the\ncreek bed during installation of the geotextile liner. The liner was anchored by folding the\ngeotextile material back on top of the riprap and then placing additional rock overtop as shown\nin drawing D-001, Detail 1 of the report. In the report, Photo 4 shows how this approach left\ngeotextile visibly exposed at the edge of the creek so it can be easily mistaken to look like some\nof the riprap has been eroded. The EoR inspected this area during the 2018 DSI and had no\nconcerns that any erosion had occurred to the riprap since installation.\nThere is an area west of the riprap discussed above where the creek is gradually eroding the\ncreek bank closer to the dam toe. This is the area referred to SP-2012-01 of the 2017 DSI. Teck\nhad planned on installing riprap in this area this past summer, but during the design process, it\nwas decided to first conduct an options review as part of long term dam closure planning to try\nensure this work was consistent with potential long term closure plans. This has caused a delay\nof one year (to 2019) to complete the design and schedule the riprap installation. The EoR\nrecognized the potential for a delay of installation as stated in the EoR?s recommendations in\nthe 2017 DSI (Recommendation SP-2016-05). The EoR recommended that if installation of the\nriprap was not complete by the end of 2018 that a monitoring program be put into place. Teck\nhas contracted WSP Engineers/Surveyors to install a monitoring system using stakes prior to\nthe end of October 2018 to comply with the 2017 DSI recommendation.\"",
                            "response_received": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                            "completion_date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                            "noncompliance_legislations": [],
                            "noncompliance_permits": [],
                            "authority_act": "Mines Act",
                            "authority_act_section": "Section 15(4)",
                            "documents": []
                        }
                    ],
                    "warning_details": []
                }
            ]
        }
    ]
}

    yield dict(NRIS_Mock_data=NRIS_Mock_data, expected_data=expected_data)
    cache.delete(NRIS_TOKEN)

def test_happy_get_from_NRIS(test_client, auth_headers, setup_info, db_session):
    mine = MineFactory()
    with mock.patch('requests.get') as nris_data_mock:

        nris_data_mock.side_effect = [MockResponse(setup_info.get('NRIS_Mock_data'), 200)]

        get_resp = test_client.get(
            f'/mines/{mine.mine_no}/compliance/summary',
            headers=auth_headers['full_auth_header'])

        get_data = json.loads(get_resp.data.decode())
        expected = setup_info.get('expected_data')

        assert get_resp.status_code == 200, get_resp.response
        assert get_data['last_inspection'] == expected['last_inspection']
        assert get_data['last_inspector'] == expected['last_inspector']
        assert get_data['num_open_orders'] == expected['num_open_orders']
        assert get_data['num_overdue_orders'] == expected['num_overdue_orders']
        assert get_data['last_12_months']['num_advisories'] == expected['last_12_months']['num_advisories']
        assert get_data['last_12_months']['num_warnings'] == expected['last_12_months']['num_warnings']
        pairs = zip(get_data['orders'], expected['orders'])
        assert any(x != y for x, y in pairs)

def test_no_NRIS_Data(test_client, auth_headers, setup_info, db_session):
    mine = MineFactory()
    with mock.patch('requests.get') as nris_mock_return:
        nris_mock_return.side_effect = [MockResponse({"records":[]}, 200)]

        get_resp = test_client.get(
            f'/mines/{mine.mine_no}/compliance/summary',
            headers=auth_headers['full_auth_header'])

        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['orders'] == []


def test_mine_not_found(test_client, auth_headers, setup_info, db_session):
    mine = MineFactory()
    with mock.patch('requests.get') as nris_mock_return:
        nris_mock_return.side_effect = [MockResponse({"records":[]}, 200)]

        get_resp = test_client.get(
            f'/mines/{mine.mine_no+"1"}/compliance/summary',
            headers=auth_headers['full_auth_header'])

        assert get_resp.status_code == 404, get_resp.response
