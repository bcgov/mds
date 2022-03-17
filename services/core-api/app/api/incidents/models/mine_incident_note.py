import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class MineIncidentNote(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_incident_note'

    mine_incident_note_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    content = db.Column(db.String(300), nullable=False)

    mine_incident_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_incident.mine_incident_guid'), nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.mine_incident_note_guid}'

    def delete(self, commit=True):
        super(MineIncidentNote, self).delete(commit)

    @classmethod
    def find_by_mine_incident_note_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_incident_note_guid=_id, deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_incident_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(
                mine_incident_guid=_id,
                deleted_ind=False).order_by(cls.update_timestamp.desc()).all()
        except ValueError:
            return None

    @classmethod
    def create(cls, mine_incident, content, add_to_session=True):
        mine_incident_note = cls(
            mine_incident_guid=mine_incident.mine_incident_guid, content=content)
        mine_incident.mine_incident_notes.append(mine_incident_note)
        if add_to_session:
            mine_incident_note.save(commit=False)
        return mine_incident_note
