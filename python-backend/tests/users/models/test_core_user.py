import pytest
from app.extensions import db
from tests.constants import TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1, TEST_PARTY_PER_PHONE_EXT_1
from app.api.users.core.models.core_user import CoreUser


@pytest.fixture(scope="function")
def setup_info(test_client):
    cu = CoreUser.create(TEST_PARTY_PER_EMAIL_1, TEST_PARTY_PER_PHONE_EXT_1,
                         TEST_PARTY_PER_PHONE_EXT_1)
    cu.save()

    yield dict(test_core_user=cu)

    db.session.delete(cu)
    db.session.commit()


def test_core_user_find_by_core_user_guid(test_client, auth_headers, setup_info):
    cu = CoreUser.find_by_core_user_guid(str(setup_info["test_core_user"].core_user_guid))
    assert str(cu.email) == TEST_PARTY_PER_EMAIL_1


def test_core_user_model_find_all(test_client, auth_headers, setup_info):
    all_cu = CoreUser.get_all()
    assert any(cu.email == TEST_PARTY_PER_EMAIL_1 for cu in all_cu)
