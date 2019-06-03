import pytest
import uuid

from app.api.variances.models.variance import (Variance,
                                               INVALID_MINE_GUID,
                                               MISSING_MINE_GUID,
                                               INVALID_VARIANCE_GUID)
from tests.factories import VarianceFactory, MineFactory
from tests.status_code_gen import RandomComplianceArticleId


# Class Query Methods
def test_variance_model_find_by_mine_guid(db_session):
    init_mine_guid = VarianceFactory().mine_guid

    variances = Variance.find_by_mine_guid(init_mine_guid)
    assert variances[0].mine_guid == init_mine_guid


def test_variance_model_find_by_mine_guid_invalid(db_session):
    with pytest.raises(AssertionError) as e:
        variances = Variance.find_by_mine_guid('jflkjfsdl')
    assert str(e.value) == INVALID_MINE_GUID

def test_variance_model_find_by_variance_id(db_session):
    init_variance_id = VarianceFactory().variance_id

    variance = Variance.find_by_variance_id(init_variance_id)
    assert variance.variance_id == init_variance_id


def test_variance_model_find_by_variance_id_fail(db_session):
    variance = Variance.find_by_variance_id(42)
    assert variance is None


def test_variance_model_find_by_variance_guid(db_session):
    init_variance_guid = VarianceFactory().variance_guid

    variance = Variance.find_by_variance_guid(init_variance_guid)
    assert variance.variance_guid == init_variance_guid


def test_variance_model_find_by_variance_guid_fail(db_session):
    variance = Variance.find_by_variance_guid(uuid.uuid4())
    assert variance is None


def test_variance_model_find_by_variance_guid_invalid(db_session):
    with pytest.raises(AssertionError) as e:
        Variance.find_by_variance_guid('abc123')
    assert str(e.value) == INVALID_VARIANCE_GUID


def test_variance_model_find_by_mine_guid_and_variance_guid(db_session):
    variance = VarianceFactory()

    fetched_variance = Variance.find_by_mine_guid_and_variance_guid(
        variance.mine_guid,
        variance.variance_guid)
    assert fetched_variance.mine_guid == variance.mine_guid
    assert fetched_variance.variance_guid == variance.variance_guid


def test_variance_model_find_by_mine_guid_and_variance_guid_fail(db_session):
    mine = MineFactory()
    with pytest.raises(AssertionError) as e:
        Variance.find_by_mine_guid_and_variance_guid(mine.mine_guid, 42)
    assert str(e.value) == INVALID_VARIANCE_GUID


# Validation methods
def test_validate_mine_guid_missing(db_session):
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=RandomComplianceArticleId,
            mine_guid=None)
    assert str(e.value) == MISSING_MINE_GUID


def test_validate_mine_guid_invalid(db_session):
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=RandomComplianceArticleId,
            mine_guid='abc123')
    assert str(e.value) == INVALID_MINE_GUID


def test_validate_applicant_guid_invalid(db_session):
    variance = VarianceFactory()
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=variance.compliance_article_id,
            mine_guid=variance.mine_guid,
            applicant_guid='abc123')
    assert 'Invalid applicant_guid' in str(e.value)
