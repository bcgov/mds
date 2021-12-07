import uuid, pytest

from app.api.EMLI_contacts.models.EMLI_contact import EMLIContact
from tests.factories import EMLIContactFactory


def test_find_EMLI_contact(db_session):
    contact = EMLIContactFactory()

    emli_contact = EMLIContact.find_EMLI_contact(contact.emli_contact_type_code,
                                                 contact.mine_region_code, contact.is_major_mine)

    assert emli_contact.emli_contact_type_code == contact.emli_contact_type_code
    assert emli_contact.mine_region_code == contact.mine_region_code


def test_find_EMLI_contact_by_guid(db_session):
    contact = EMLIContactFactory()

    emli_contact = EMLIContact.find_EMLI_contact_by_guid(contact.contact_guid)
    assert emli_contact.contact_guid == contact.contact_guid


def test_find_EMLI_contacts_by_mine_region(db_session):
    contact = EMLIContactFactory()

    emli_contact = EMLIContact.find_EMLI_contacts_by_mine_region(contact.mine_region_code,
                                                                 contact.is_major_mine)
    assert (c.mine_region == None if c.emli_contact_type_code in ('MMO', 'CHP', 'CHI') else
            c.mine_region == contact.mine_region for c in emli_contact)


def test_find_all(db_session):
    batch_size = 3
    contacts = EMLIContactFactory.create_batch(size=batch_size)

    all_contacts = EMLIContact.get_all()

    assert len(all_contacts) == 31