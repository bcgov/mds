import uuid, pytest

from app.api.ministry_contacts.models.ministry_contact import MinistryContact
from tests.factories import MinistryContactFactory


def test_find_ministry_contact(db_session):
    contact = MinistryContactFactory()

    ministry_contact = MinistryContact.find_ministry_contact(contact.emli_contact_type_code,
                                                 contact.mine_region_code, contact.is_major_mine)

    assert ministry_contact.emli_contact_type_code == contact.emli_contact_type_code
    assert ministry_contact.mine_region_code == contact.mine_region_code


def test_find_ministry_contact_by_guid(db_session):
    contact = MinistryContactFactory()

    ministry_contact = MinistryContact.find_ministry_contact_by_guid(contact.contact_guid)
    assert ministry_contact.contact_guid == contact.contact_guid


def test_find_ministry_contacts_by_mine_region(db_session):
    contact = MinistryContactFactory()

    ministry_contact = MinistryContact.find_ministry_contacts_by_mine_region(contact.mine_region_code,
                                                                 contact.is_major_mine)
    assert (c.mine_region == None if c.emli_contact_type_code in ('MMO', 'CHP', 'CHI') else
            c.mine_region == contact.mine_region for c in ministry_contact)


def test_find_ministry_contacts_by_mine_region_excludes_non_general_major_mine_contact(db_session):
    contact = MinistryContactFactory(is_major_mine=True, is_general_contact=False)
    results = MinistryContact.find_ministry_contacts_by_mine_region(contact.mine_region_code, True)
    assert contact.contact_guid not in [c.contact_guid for c in results]


def test_find_ministry_contacts_by_mine_region_includes_general_major_mine_contact(db_session):
    contact = MinistryContactFactory(is_major_mine=True, is_general_contact=True)
    results = MinistryContact.find_ministry_contacts_by_mine_region(contact.mine_region_code, True)
    assert contact.contact_guid in [c.contact_guid for c in results]


def test_find_ministry_contacts_by_mine_region_includes_non_general_regional_contact(db_session):
    contact = MinistryContactFactory(is_major_mine=False, is_general_contact=False)
    results = MinistryContact.find_ministry_contacts_by_mine_region(contact.mine_region_code, False)
    assert contact.contact_guid in [c.contact_guid for c in results]


def test_find_ministry_contacts_by_mine_region_regional_mine_includes_general_contact_via_union(db_session):
    contact = MinistryContactFactory(is_major_mine=True, is_general_contact=True)
    results = MinistryContact.find_ministry_contacts_by_mine_region(contact.mine_region_code, False)
    assert contact.contact_guid in [c.contact_guid for c in results]


# def test_find_all(db_session):
#     batch_size = 3
#     contacts = MinistryContactFactory.create_batch(size=batch_size)

#     all_contacts = MinistryContact.get_all()

#     assert len(all_contacts) == 31
