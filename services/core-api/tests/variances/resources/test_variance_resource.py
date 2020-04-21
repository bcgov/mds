import json
from datetime import datetime, timedelta

from tests.status_code_gen import *
from tests.factories import VarianceFactory, MineFactory
from tests.status_code_gen import RandomVarianceApplicationStatusCode
from app.api.variances.resources.variance_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

class TestGetVariances:
    """GET /variances"""

    def test_get_variances(self, test_client, db_session, auth_headers):
        """Should return all records and a 200 response code"""

        batch_size = 3
        variances = VarianceFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/variances', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(
            str(variance.variance_guid) in map(lambda v: v['variance_guid'], get_data['records'])
            for variance in variances)
        assert all(
            variance.variance_no in map(lambda v: v['variance_no'], get_data['records'])
            for variance in variances)

    def test_get_variances_pagination(self, test_client, db_session, auth_headers):
        """Should return paginated records"""

        batch_size = PER_PAGE_DEFAULT + 1
        variances = VarianceFactory.create_batch(size=batch_size)

        get_resp = test_client.get('/variances', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == PER_PAGE_DEFAULT
        assert get_data['current_page'] == PAGE_DEFAULT
        assert get_data['total'] == batch_size

    def test_get_variances_application_status_filter(self, test_client, db_session, auth_headers):
        """Should respect variance_application_status_code query param"""

        batch_size = 3
        variances = VarianceFactory.create_batch(size=batch_size)
        status_code = RandomVarianceApplicationStatusCode()

        get_resp = test_client.get(
            f'/variances?variance_application_status_code={status_code}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(map(lambda v: v['variance_application_status_code'] == status_code, get_data['records']))

    def test_get_variances_application_status_filter_list(self, test_client, db_session, auth_headers):
        """Should respect variance_application_status_code query param as a comma-separated list"""

        batch_size = 3
        variances = VarianceFactory.create_batch(size=batch_size)
        status_code_1 = RandomVarianceApplicationStatusCode()
        status_code_2 = RandomVarianceApplicationStatusCode()
        status_codes = [status_code_1, status_code_2]

        get_resp = test_client.get(
            f'/variances?variance_application_status_code={status_code_1},{status_code_2}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(map(
            lambda v: v['variance_application_status_code'] in status_codes,
            get_data['records']))

    def test_get_variances_application_filter_by_mine_region(self, test_client, db_session, auth_headers):
        """Should filter variances by mine region"""
        region_code = "NW"
        mine_with_region_nw = MineFactory(mine_region='NW')
        mine_with_region_sw = MineFactory(mine_region="SW")
        batch_size = 3
        VarianceFactory.create_batch(size=batch_size)
        VarianceFactory(mine=mine_with_region_nw)
        VarianceFactory(mine=mine_with_region_sw)

        get_resp = test_client.get(f'/variances?region={region_code}',headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(map(
            lambda v: v['mine_name'] == mine_with_region_nw.mine_name,
            get_data['records']))

    def test_get_variances_application_filter_by_major_mine(self, test_client, db_session, auth_headers):
        """Should filter variances by major vs regional mine"""
        major_mine = MineFactory(major_mine_ind=True)
        regional_mine = MineFactory(major_mine_ind=False)

        VarianceFactory(mine=major_mine)
        VarianceFactory(mine=regional_mine)
        get_resp = test_client.get(f'/variances?major=f', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(map(
            lambda v: v['mine_name'] == regional_mine.mine_name,
            get_data['records']))

    def test_get_variances_application_filter_by_compliance_code(self, test_client, db_session, auth_headers):
        """Should filter variances by compliance code"""
        compliance_codes = [RandomComplianceArticleId(),RandomComplianceArticleId()]
        batch_size = 3
        VarianceFactory.create_batch(size=batch_size)
        VarianceFactory(compliance_article_id=compliance_codes[0])
        VarianceFactory(compliance_article_id=compliance_codes[1])

        get_resp = test_client.get(
            f'/variances?compliance_code={compliance_codes[0]}&compliance_code={compliance_codes[1]}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(map(
            lambda v: v['compliance_article_id'] in compliance_codes,
            get_data['records']))

    def test_get_variances_application_filter_by_issue_date(self, test_client, db_session, auth_headers):
        """Should filter variances by issue date"""
        date_minus_7_days = datetime.now() - timedelta(days=7)
        date_minus_1_day = datetime.now() - timedelta(days=1)
        date_today = datetime.now()
        date_plus_1_day = datetime.now() + timedelta(days=1)
        date_plus_7_days = datetime.now() + timedelta(days=7)
        VarianceFactory(approved=True,issue_date=date_minus_7_days)
        VarianceFactory(approved=True,issue_date=date_today)
        VarianceFactory(approved=True,issue_date=date_plus_7_days)
        date_format = "%Y-%m-%d"
        get_resp = test_client.get(
            f'/variances?issue_date_before={date_plus_1_day.strftime(date_format)}&issue_date_after={date_minus_1_day.strftime(date_format)}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['records'][0]['issue_date'] == date_today.strftime(date_format)

    def test_get_variances_application_filter_by_expiry_date(self, test_client, db_session, auth_headers):
        """Should filter variances by expiry date"""
        date_minus_7_days = datetime.now() - timedelta(days=7)
        date_minus_1_day = datetime.now() - timedelta(days=1)
        date_today = datetime.now()
        date_plus_1_day = datetime.now() + timedelta(days=1)
        date_plus_7_days = datetime.now() + timedelta(days=7)
        date_format ="%Y-%m-%d"
        VarianceFactory(approved=True,expiry_date=date_minus_7_days)
        VarianceFactory(approved=True,expiry_date=date_today)
        VarianceFactory(approved=True,expiry_date=date_plus_7_days)

        get_resp = test_client.get(
            f'/variances?expiry_date_before={date_plus_1_day.strftime(date_format)}&expiry_date_after={date_minus_1_day.strftime(date_format)}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['records'][0]['expiry_date'] == date_today.strftime(date_format)
