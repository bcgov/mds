import json

from tests.factories import VarianceFactory, MineFactory
from tests.status_code_gen import RandomComplianceArticleId
from app.api.utils.custom_reqparser import DEFAULT_MISSING_REQUIRED
from app.api.variances.models.variance_document_category_code import VarianceDocumentCategoryCode


class TestGetVarianceDocumentCategoryCode:
    """GET /variances/document-categories"""
    def test_get_variance_document_category_codes(self, test_client, db_session, auth_headers):
        """Should return the correct number of records with a 200 response code"""

        get_resp = test_client.get(
            f'/variances/document-categories', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == len(VarianceDocumentCategoryCode.get_active())
