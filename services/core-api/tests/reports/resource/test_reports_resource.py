import json
import uuid
from datetime import datetime, timedelta

from tests.factories import MineFactory

THREE_REPORTS = 3
ONE_REPORT = 1
GUID = str(uuid.uuid4)


def test_get_reports(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=THREE_REPORTS)
    get_resp = test_client.get(
        f'/mines/reports', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == THREE_REPORTS
    assert get_resp.status_code == 200

    # Test with pagination
    get_resp = test_client.get(
        f'/mines/reports?page=1&per_page=2',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) <= 2
    assert get_resp.status_code == 200

    # Test sort by due_date in ascending order
    get_resp = test_client.get(
        f'/mines/reports?mine_reports_type=CRR&sort_field=due_date&sort_dir=asc',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == len(mine.mine_reports)
    for i in range(len(get_data['records']) - 1):
        assert datetime.strptime(get_data['records'][i]['due_date'], '%Y-%m-%d') <= datetime.strptime(
            get_data['records'][i + 1]['due_date'], '%Y-%m-%d')

    # Test filter by a specific report name
    specific_report_name = mine.mine_reports[0].mine_report_guid

    get_resp = test_client.get(
        f'/mines/reports?mine_reports_type=CRR&report_name={specific_report_name}',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert all(report['report_name'] == specific_report_name for report in get_data['records'])

    # Test filter by received date range
    start_date = datetime.combine(mine.mine_reports[0].received_date, datetime.min.time()) - timedelta(days=1)
    end_date = datetime.combine(mine.mine_reports[0].received_date, datetime.min.time()) + timedelta(days=1)


    get_resp = test_client.get(
        f'/mines/reports?mine_reports_type=CRR&received_date_after={start_date.strftime("%Y-%m-%d")}&received_date_before={end_date.strftime("%Y-%m-%d")}',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200

    for report in get_data['records']:
        received_date = datetime.strptime(report['received_date'], '%Y-%m-%d')

        assert (start_date <= received_date)
        assert (received_date <= end_date)
