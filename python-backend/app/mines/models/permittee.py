from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

from .party import Party
from .mixins import AuditMixin, Base


class Permittee(AuditMixin, Base):
    __tablename__ = 'permittee'
    permittee_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'))
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))

    def __repr__(self):
        return '<Permittee %r>' % self.permittee_guid

    def json(self):
        party = Party.find_by_party_guid(str(self.party_guid))
        return {
            'permittee_guid': str(self.permittee_guid),
            'permit_guid': str(self.permit_guid),
            'party_guid': str(self.party_guid),
            'party_name': party.party_name if party else None
        }

    @classmethod
    def find_by_permittee_guid(cls, _id):
        return cls.query.filter_by(permittee_guid=_id).first()

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()
