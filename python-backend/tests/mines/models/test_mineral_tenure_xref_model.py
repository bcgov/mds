import uuid

import pytest

from tests.constants import TEST_TENURE_ID
from app.api.mines.mine.models.mine import MineralTenureXref


# MineralTenureXref Class Methods
def test_mineral_tenure_xref_detail_model_find_by_tenure(test_client, auth_headers):
    tenure = MineralTenureXref.find_by_tenure(TEST_TENURE_ID)
    assert str(tenure.tenure_number_id) == TEST_TENURE_ID


def test_tenure_model_validate_tenure_id(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        MineralTenureXref(
            mineral_tenure_xref_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            tenure_number_id=''.join(['{}'.format(x) for x in range(11)]),
        )
    assert 'Tenure number must be 6 or 7 digits long.' in str(e.value)
