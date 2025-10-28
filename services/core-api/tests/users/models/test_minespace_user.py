from app.api.users.minespace.models.minespace_user import MinespaceUser
from tests.factories import MinespaceUserFactory, MineFactory, MinespaceSubscriptionFactory


def test_minespace_user_model_find_by_id(db_session):
    user = MinespaceUserFactory()

    mu = MinespaceUser.find_by_id(user.user_id)
    assert mu.email_or_username == user.email_or_username


def test_minespace_user_model_find_by_email(db_session):
    email_or_username = MinespaceUserFactory().email_or_username

    mu = MinespaceUser.find_by_email(email_or_username)
    assert mu.email_or_username == email_or_username


def test_minespace_user_model_find_all(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    all_mu = MinespaceUser.get_all()
    assert len(all_mu) == 2
    assert any(mu.email_or_username == user1.email_or_username for mu in all_mu)


def test_minespace_user_model_find_by_mine_guid(db_session):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    user3 = MinespaceUserFactory()

    mine1 = MineFactory()
    mine2 = MineFactory()

    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user1)
    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user2)
    MinespaceSubscriptionFactory(mine=mine2, minespace_user=user3)

    users_by_mine1 = MinespaceUser.find_by_mine_guid(mine1.mine_guid)
    assert len(users_by_mine1) == 2
    
    # all users assigned to mine1 should be returned, but not other subscriptions
    user_ids = list(x.user_id for x in users_by_mine1)    
    assert user_ids == [user1.user_id, user2.user_id]