from tests.factories import MineIncidentFactory, MineIncidentNoteFactory

from app.api.incidents.models.mine_incident_note import MineIncidentNote


def test_mine_incident_note_find_by_mine_incident_note_guid(db_session):
    mine_incident = MineIncidentFactory()
    mine_incident_note = MineIncidentNoteFactory(
        mine_incident_guid=mine_incident.mine_incident_guid)
    mine_incident_note_guid = mine_incident_note.mine_incident_note_guid
    mine_incident_note = MineIncidentNote.find_by_mine_incident_note_guid(
        str(mine_incident_note_guid))
    assert mine_incident_note.mine_incident_note_guid == mine_incident_note_guid


def test_mine_incident_note_find_by_mine_incident_guid(db_session):
    batch_size = 3
    mine_incident = MineIncidentFactory()
    mine_incident_notes = MineIncidentNoteFactory.create_batch(
        size=batch_size, mine_incident_guid=mine_incident.mine_incident_guid)
    mine_incident_guid = mine_incident.mine_incident_guid

    mine_incident_notes = MineIncidentNote.find_by_mine_incident_guid(str(mine_incident_guid))
    assert len(mine_incident_notes) == batch_size
    assert all(_mine_incident.mine_incident_guid == mine_incident_guid
               for _mine_incident in mine_incident_notes)
