import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
import time
import random

from tests.status_code_gen import *
from tests.factories import MineIncidentFactory, MineFactory


class TestGetIncidents:
    """GET /incidents"""

    # get all incidents
    def test_get_incidents(self, test_client, db_session, auth_headers):
        """Should return all records and a 200 response code"""
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size)
        get_resp = test_client.get(
            '/incidents?per_page=25', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size

    def test_get_incidents_status_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents status query param"""
        batch_size = 5
        status_pre = "WNS"
        MineIncidentFactory.create_batch(size=batch_size, status_code=status_pre)
        status_fin = "CLD"
        MineIncidentFactory.create_batch(size=batch_size, status_code=status_fin)
        get_resp = test_client.get(
            f"/incidents?incident_status={status_pre}", headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(map(lambda v: v['status_code'] == status_pre, get_data['records']))

    def test_get_incidents_determination_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents determination query param"""
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size, determination_type_code="PEN")
        MineIncidentFactory.create_batch(size=batch_size, determination_type_code="DO")
        MineIncidentFactory.create_batch(size=batch_size, determination_type_code="NDO")
        get_resp = test_client.get(
            f"/incidents?determination=DO&determination=NDO",
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2 * batch_size
        assert all(
            map(lambda v: v['determination_type_code'] in ["DO", "NDO"], get_data['records']))

    def test_get_incidents_codes_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents codes query param"""
        code1 = SampleDangerousOccurrenceSubparagraphs(1)
        code2 = SampleDangerousOccurrenceSubparagraphs(2)
        code3 = SampleDangerousOccurrenceSubparagraphs(1)
        batch_size = 5
        MineIncidentFactory.create_batch(
            size=batch_size, determination_type_code='DO', dangerous_occurrence_subparagraphs=code1)
        MineIncidentFactory.create_batch(
            size=batch_size, determination_type_code='DO', dangerous_occurrence_subparagraphs=code2)
        MineIncidentFactory.create_batch(
            size=batch_size, determination_type_code='DO', dangerous_occurrence_subparagraphs=code3)

        get_resp = test_client.get(
            f"/incidents?codes={code2[0].compliance_article_id}&codes={code2[1].compliance_article_id}",
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        # The intersection of two lists
        assert all(
            map(
                lambda v: set(v['dangerous_occurrence_subparagraph_ids'])
                & set([code2[0].compliance_article_id, code2[1].compliance_article_id]),
                get_data['records']))

    # TODO: refactor to not use 5 random timestamps; this causes the select size == 1 to be very fragile
    # def test_get_incidents_year_filter(self, test_client, db_session, auth_headers):
    #     """Should respect incidents year query param"""
    #     batch_size = 5
    #     MineIncidentFactory.create_batch(size=batch_size)
    #     date_time = datetime.fromtimestamp(time.time()) + relativedelta(years=1)
    #     MineIncidentFactory(incident_timestamp=date_time)
    #     incident_year = str(date_time.year)
    #     get_resp = test_client.get(
    #         f"/incidents?year={incident_year}", headers=auth_headers['full_auth_header'])
    #     get_data = json.loads(get_resp.data.decode())
    #     assert get_resp.status_code == 200
    #     assert len(get_data['records']) == 1
    #     assert all(
    #         map(lambda v: v['incident_timestamp'][0:4] == incident_year, get_data['records']))

    def test_get_incidents_major_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents major mine indicator param"""
        batch_size = 3
        small_batch_size = 3
        major_mine = MineFactory.create_batch(size=small_batch_size, major_mine_ind=True)
        MineFactory.create_batch(size=batch_size, major_mine_ind=False)

        get_resp = test_client.get(f"/incidents?major=t", headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == small_batch_size
        assert all(
            map(lambda v: v['mine_name'] in [mine.mine_name for mine in major_mine],
                get_data['records']))

    def test_get_incidents_search_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents search query param"""
        MineFactory(mine_no='12345')
        MineFactory(mine_no="678910", mine_name='steve')
        MineFactory(mine_name="7891011")
        get_resp = test_client.get(
            f'/incidents?search=78910', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == 2
        assert all(map(lambda v: v['mine_name'] in ["7891011", "steve"], get_data['records']))

    def test_get_incidents_region_filter(self, test_client, db_session, auth_headers):
        """Should respect incidents region query param"""
        region_code = "NW"
        mine_with_region_nw = MineFactory(mine_region='NW')
        mine_with_region_sw = MineFactory(mine_region="SW")
        batch_size = 3
        MineIncidentFactory.create_batch(size=batch_size)
        MineIncidentFactory(mine=mine_with_region_nw)
        MineIncidentFactory(mine=mine_with_region_sw)
        get_resp = test_client.get(
            f'/incidents?region={region_code}', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert all(
            map(lambda v: v['mine_name'] == mine_with_region_nw.mine_name, get_data['records']))

    def test_get_incidents_date_sort(self, test_client, db_session, auth_headers):
        """Should respect incidents date sort"""
        sort_field = "incident_timestamp"
        sort_dir = "desc"
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size)
        get_resp = test_client.get(
            f'/incidents?sort_field={sort_field}&sort_dir={sort_dir}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(get_data['records'][i]['incident_timestamp'] >= get_data['records'][i + 1]
                   ['incident_timestamp'] for i in range(len(get_data['records']) - 1))

    # TODO: When this incident_no is implemented a test on sorting by it will be needed
    # def test_get_incidents_incident_no_sort(self, test_client, db_session, auth_headers):
    #     """Should respect incidents incident_no sort"""

    def test_get_incidents_determination_sort(self, test_client, db_session, auth_headers):
        """Should respect incidents determination sort"""
        sort_field = "determination"
        sort_dir = "asc"
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size)
        get_resp = test_client.get(
            f'/incidents?sort_field={sort_field}&sort_dir={sort_dir}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(get_data['records'][i]['determination_type_code'] <= get_data['records'][i + 1]
                   ['determination_type_code'] for i in range(len(get_data['records']) - 1))

    def test_get_incidents_status_sort(self, test_client, db_session, auth_headers):
        """Should respect incidents status sort"""
        sort_field = "incident_status"
        sort_dir = "desc"
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size)
        get_resp = test_client.get(
            f'/incidents?sort_field={sort_field}&sort_dir={sort_dir}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(
            get_data['records'][i]['status_code'] >= get_data['records'][i + 1]['status_code']
            for i in range(len(get_data['records']) - 1))

    def test_get_incidents_mine_name_sort(self, test_client, db_session, auth_headers):
        """Should respect incidents mine_name sort"""
        sort_field = "mine_name"
        sort_dir = "desc"
        batch_size = 5
        MineIncidentFactory.create_batch(size=batch_size)
        get_resp = test_client.get(
            f'/incidents?sort_field={sort_field}&sort_dir={sort_dir}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(get_data['records'][i]['mine_name'] >= get_data['records'][i + 1]['mine_name']
                   for i in range(len(get_data['records']) - 1))

    def test_get_incidents_sort_and_filter_multiple_fields(self, test_client, db_session,
                                                           auth_headers):
        """Should respect incidents sort and filter by multiple fields"""
        batch_size = 5
        status_pre = "WNS"
        MineIncidentFactory.create_batch(size=batch_size, status_code=status_pre)
        status_fin = "CLD"
        MineIncidentFactory.create_batch(size=batch_size, status_code=status_fin)
        sort_field = "mine_name"
        sort_dir = "desc"
        page_size = 5
        page_number = 1
        get_resp = test_client.get(
            f'/incidents?sort_field={sort_field}&sort_dir={sort_dir}&incident_status={status_pre}&page_size={page_size}&page_number={page_number}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size
        assert all(map(lambda v: v['status_code'] == status_pre, get_data['records']))
        assert all(get_data['records'][i]['mine_name'] >= get_data['records'][i + 1]['mine_name']
                   for i in range(len(get_data['records']) - 1))
