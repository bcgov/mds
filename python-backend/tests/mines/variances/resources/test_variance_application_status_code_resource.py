import json

from tests.factories import VarianceFactory, MineFactory
from tests.status_code_gen import RandomComplianceArticleId
from app.api.utils.custom_reqparser import DEFAULT_MISSING_REQUIRED
from app.api.mines.variances.models.variance_application_status_code import VarianceApplicationStatusCode


# GET
def test_get_variance_codes(test_client, db_session, auth_headers):
    get_resp = test_client.get(f'/variances/status-codes', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['records']) == len(VarianceApplicationStatusCode.active_codes())
