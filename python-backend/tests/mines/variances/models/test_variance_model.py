import pytest

from app.api.mines.variances.models.variance import Variance
from tests.factories import VarianceFactory
from tests.status_code_gen import RandomComplianceArticleId


# Class Query Methods
def test_variance_model_find_by_mine_guid(db_session):
    init_mine_guid = VarianceFactory().mine_guid

    variances = Variance.find_by_mine_guid(init_mine_guid)
    assert variances[0].mine_guid == init_mine_guid


def test_variance_model_find_by_mine_guid_invalid(db_session):
    VarianceFactory()

    variances = Variance.find_by_mine_guid('jflkjfsdl')
    assert variances == None


def test_variance_model_find_by_variance_id(db_session):
    init_variance_id = VarianceFactory().variance_id

    variance = Variance.find_by_variance_id(init_variance_id)
    assert variance.variance_id == init_variance_id


def test_variance_model_find_by_variance_id_fail(db_session):
    variance = Variance.find_by_variance_id(42)
    assert variance is None


# Validation methods
def test_validate_mine_guid_missing(db_session):
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=RandomComplianceArticleId,
            mine_guid=None)
    assert 'Missing mine_guid' in str(e.value)


def test_validate_mine_guid_invalid(db_session):
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=RandomComplianceArticleId,
            mine_guid='abc123')
    assert 'Invalid mine_guid' in str(e.value)


def test_validate_applicant_guid_invalid(db_session):
    variance = VarianceFactory()
    with pytest.raises(AssertionError) as e:
        Variance(
            compliance_article_id=variance.compliance_article_id,
            mine_guid=variance.mine_guid,
            applicant_guid='abc123')
    assert 'Invalid applicant_guid' in str(e.value)
