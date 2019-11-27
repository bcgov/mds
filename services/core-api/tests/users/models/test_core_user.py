import pytest

from app.api.users.core.models.core_user import CoreUser
from tests.factories import CoreUserFactory


def test_core_user_find_by_core_user_guid(db_session):
    user = CoreUserFactory()

    cu = CoreUser.find_by_core_user_guid(str(user.core_user_guid))
    assert cu is not None
    assert cu.email == user.email


def test_core_user_model_find_all(db_session):
    batch_size = 3
    users = CoreUserFactory.create_batch(size=batch_size)

    all_cu = CoreUser.get_all()
    assert len(all_cu) == batch_size
