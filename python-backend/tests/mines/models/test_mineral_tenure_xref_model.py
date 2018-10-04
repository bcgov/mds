from tests.constants import TEST_TENURE_ID
from app.api.mine.models.mines import MineralTenureXref


# MineralTenureXref Class Methods
def test_mineral_tenure_xref_detail_model_find_by_tenure(test_client, auth_headers):
    tenure = MineralTenureXref.find_by_tenure(TEST_TENURE_ID)
    assert str(tenure.tenure_number_id) == TEST_TENURE_ID
