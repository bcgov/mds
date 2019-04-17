import uuid
import pytest

from app.api.mines.mine.models.mineral_tenure_xref import MineralTenureXref


def test_tenure_model_validate_tenure_id_short():
    with pytest.raises(AssertionError) as e:
        MineralTenureXref(
            mineral_tenure_xref_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            tenure_number_id='12345',
        )
    assert 'Tenure number must be 6 or 7 digits long.' in str(e.value)


def test_tenure_model_validate_tenure_id_long():
    with pytest.raises(AssertionError) as e:
        MineralTenureXref(
            mineral_tenure_xref_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            tenure_number_id='12345678',
        )
    assert 'Tenure number must be 6 or 7 digits long.' in str(e.value)
