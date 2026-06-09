import pytest
from app.api.ministry_contacts.models.distribution_list import DistributionList

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

def test_distribution_list_create(db_session):
    dl = DistributionList.create('Test List')
    db_session.add(dl)
    db_session.commit()

    found_dl = DistributionList.find_by_name('Test List')
    assert found_dl is not None
    assert found_dl.distribution_list_name == 'Test List'
