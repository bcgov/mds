import pytest
from app.api.ministry_contacts.models.distribution_list import DistributionList
from app.api.ministry_contacts.models.distribution_list_user import DistributionListUser
from tests.factories import MinistryContactFactory

def test_distribution_list_find_by_name(db_session):
    # The DB is seeded with distribution lists, e.g. "Core Default" or "Major Projects"
    # We will test finding one of the seeded lists
    dl = DistributionList.find_by_name('Major Projects')
    assert dl is not None
    assert dl.distribution_list_name == 'Major Projects'

def test_distribution_list_get_emails(db_session):
    dl = DistributionList.find_by_name('Major Projects')
    assert dl is not None
    emails = dl.get_emails()
    assert isinstance(emails, list)

def test_distribution_list_get_emails_excludes_soft_deleted_users(db_session):
    dl = DistributionList.create('DL Soft Delete Test')
    db_session.add(dl)

    contact = MinistryContactFactory()
    db_session.add(contact)
    db_session.flush()

    dlu = DistributionListUser.create(dl.distribution_list_guid, contact.contact_guid)
    db_session.add(dlu)
    db_session.commit()

    dl = DistributionList.find_by_name('DL Soft Delete Test')
    assert contact.email in dl.get_emails()

    dlu.deleted_ind = True
    db_session.commit()
    db_session.expire(dl)

    assert contact.email not in dl.get_emails()


def test_distribution_list_create(db_session):
    dl = DistributionList.create('Test List')
    db_session.add(dl)
    db_session.commit()

    found_dl = DistributionList.find_by_name('Test List')
    assert found_dl is not None
    assert found_dl.distribution_list_name == 'Test List'
