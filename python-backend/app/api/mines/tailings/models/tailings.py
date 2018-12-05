from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db

class MineTailingsStorageFacility(AuditMixin, Base):
    __tablename__ = "mine_tailings_storage_facility"
    mine_tailings_storage_facility_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    mine_tailings_storage_facility_name = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return '<MineTailingsStorageFacility %r>' % self.mine_guid

    def json(self):
        return {
            'mine_tailings_storage_facility_guid': str(self.mine_tailings_storage_facility_guid),
            'mine_guid': str(self.mine_guid),
            'mine_tailings_storage_facility_name': str(self.mine_tailings_storage_facility_name)
        }

    @classmethod
    def create_tailings_facility(cls, mine_guid, tailings_facility_name, user_kwargs):
        new_mine = cls(
            mine_guid=mine_guid,
            mine_tailings_storage_facility_name=tailings_facility_name,
            **user_kwargs
        )

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).all()

    @classmethod
    def find_by_tsf_guid(cls, tsf_guid):
        return cls.query.filter_by(mine_tailings_storage_facility_guid=tsf_guid).first()


    @validates('mine_tailings_storage_facility_name')
    def validate_mine_name(self, key, mine_tailings_storage_facility_name):
        if not mine_tailings_storage_facility_name:
            raise AssertionError('No tailings storage facility name provided.')
        if len(mine_tailings_storage_facility_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        #no duplicate TSF names on the same mine
        if (MineTailingsStorageFacility.query.filter_by(mine_guid=self.mine_guid)
                    .filter_by(mine_tailings_storage_facility_name=mine_tailings_storage_facility_name).first() is not None):
            raise AssertionError(f'this mine already has a tailings storage facility named: "{mine_tailings_storage_facility_name}"')
        return mine_tailings_storage_facility_name
