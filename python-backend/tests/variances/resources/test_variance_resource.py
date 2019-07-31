import json

from tests.factories import VarianceFactory
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
