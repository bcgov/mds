from tests.factories import ExplosivesPermitAmendmentFactory

from app.api.mines.explosives_permit_amendment.models.explosives_permit_amendment import ExplosivesPermitAmendment

def test_explosives_permit_amendment_find_by_explosives_permit_amendment_guid(db_session):
    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()
    explosives_permit_amendment_guid = explosives_permit_amendment.explosives_permit_amendment_guid
    explosives_permit_amendment = ExplosivesPermitAmendment.find_by_explosives_permit_amendment_guid(str(explosives_permit_amendment_guid))
    assert explosives_permit_amendment.explosives_permit_amendment_guid == explosives_permit_amendment_guid

def test_explosives_permit_amendment_find_by_explosives_permit_id(db_session):
    explosives_permit_amendment = ExplosivesPermitAmendmentFactory()
    explosives_permit_id = explosives_permit_amendment.explosives_permit_id
    explosives_permit_amendments = ExplosivesPermitAmendment.find_by_explosives_permit_id(explosives_permit_id)
    assert any(amendment.explosives_permit_id == explosives_permit_id for amendment in explosives_permit_amendments)