from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db

class MineTailingsStorageFacility(AuditMixin, Base):
    __tablename__ = "mine_tailings_storage_facility"
    mine_tailings_storage_facility_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_tailings_storage_facility.mine_guid'))
    mine_tailings_storage_facility_name = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return '<MineTailingsStorageFacility %r>' % self.mine_guid

    def json(self):
        return {'mine_tailings_storage_facility_name': self.mine_tailings_storage_facility_name}

    @validates('mine_tailings_storage_facility_name')
    def validate_mine_name(self, key, mine_tailings_storage_facility_name):
        if not mine_tailings_storage_facility_name:
            raise AssertionError('No tailings storage facility name provided.')
        if len(mine_tailings_storage_facility_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        return mine_tailings_storage_facility_name
