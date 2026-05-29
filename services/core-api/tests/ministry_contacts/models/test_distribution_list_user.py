import pytest
from app.api.ministry_contacts.models.distribution_list import DistributionList
from app.api.ministry_contacts.models.distribution_list_user import DistributionListUser
from tests.factories import MinistryContactFactory

def test_distribution_list_user_create(db_session):
    dl = DistributionList.create('DL User Test List')
    db_session.add(dl)
    
    contact = MinistryContactFactory()
    db_session.add(contact)
    db_session.flush()

    dlu = DistributionListUser.create(dl.distribution_list_guid, contact.contact_guid)
    db_session.add(dlu)
    db_session.commit()

    found_dlu = DistributionListUser.query.filter_by(distribution_list_guid=dl.distribution_list_guid, contact_guid=contact.contact_guid).first()
    assert found_dlu is not None

def test_distribution_list_user_find_by_contact_guid(db_session):
    dl = DistributionList.create('DL User Test List 2')
    db_session.add(dl)
    
    contact = MinistryContactFactory()
    db_session.add(contact)
    db_session.flush()

    dlu = DistributionListUser.create(dl.distribution_list_guid, contact.contact_guid)
    db_session.add(dlu)
    db_session.commit()

    results = DistributionListUser.find_by_contact_guid(contact.contact_guid)
    assert len(results) > 0
    assert results[0].contact_guid == contact.contact_guid
