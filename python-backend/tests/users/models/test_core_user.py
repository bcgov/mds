import pytest
from app.extensions import db
from tests.constants import TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1, TEST_PARTY_PER_PHONE_EXT_1
from app.api.users.core.models.core_user import CoreUser


@pytest.fixture(scope="function")
def setup_info(test_client):
    mu = CoreUser.create(TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1,
                         TEST_PARTY_PER_PHONE_EXT_1)
    mu.save()

    yield dict(test_core_user=mu)

    db.session.delete(mu)
    db.session.commit()


def test_core_user_find_by_core_user_guid(test_client, auth_headers, setup_info):
    mu = CoreUser.find_by_core_user_guid(setup_info["test_minespace_user"].core_user_guid)
    assert str(mu.email) == TEST_PARTY_PER_EMAIL_1


def test_core_user_model_find_all(test_client, auth_headers, setup_info):
    all_mu = CoreUser.get_all()
    assert any(mu.email == TEST_PARTY_PER_EMAIL_1 for mu in all_mu)
