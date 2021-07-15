from tests.factories import MineFactory, ExplosivesPermitFactory

from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit


def test_explosives_permit_find_by_explosives_permit_guid(db_session):
    explosives_permit = ExplosivesPermitFactory()
    explosives_permit_guid = explosives_permit.explosives_permit_guid
    explosives_permit = ExplosivesPermit.find_by_explosives_permit_guid(str(explosives_permit_guid))
    assert explosives_permit.explosives_permit_guid == explosives_permit_guid


def test_explosives_permit_find_by_mine_guid(db_session):
    batch_size = 2
    mine = MineFactory(minimal=True)
    ExplosivesPermitFactory.create_batch(mine=mine, size=batch_size)

    mine_guid = mine.mine_guid

    explosives_permits = ExplosivesPermit.find_by_mine_guid(str(mine_guid))
    assert len(explosives_permits) == batch_size
    assert all(explosives_permit.mine_guid == mine_guid for explosives_permit in explosives_permits)
