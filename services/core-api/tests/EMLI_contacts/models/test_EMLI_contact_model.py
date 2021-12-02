import uuid, pytest

from app.api.EMLI_contacts.models.EMLI_contact import EMLIContact
from tests.factories import EMLIContactFactory

def test_find_EMLI_contact(db_session):
    contact = EMLIContactFactory()

    emli_contact = EMLIContact.find_EMLI_contact(contact.emli_contact_type_code,
                                                 contact.mine_region_code, contact.is_major_mine)

    assert emli_contact.emli_contact_type_code == contact.emli_contact_type_code
    assert emli_contact.mine_region_code == contact.mine_region_code

def test_find_EMLI_contact_by_id(db_session):
    contact_id = EMLIContactFactory().contact_id

    emli_contact = EMLIContact.find_EMLI_contact_by_id(contact_id)
    assert emli_contact.contact_id == contact_id

def test_find_EMLI_contacts_by_mine_region(db_session):
    mine_region_code = EMLIContactFactory().mine_region_code

    emli_contact = EMLIContact.find_EMLI_contacts_by_mine_region(mine_region_code)

    assert emli_contact[0].mine_region_code == mine_region_code


def test_find_all(db_session):
    batch_size = 3
    contacts = EMLIContactFactory.create_batch(size=batch_size)

    all_contacts = EMLIContact.get_all()

    assert len(all_contacts) == 3
