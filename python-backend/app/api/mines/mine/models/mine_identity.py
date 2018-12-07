from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from ...region.models.region import MineRegionCode
from app.extensions import db


class MineIdentity(AuditMixin, Base):
    __tablename__ = 'mine_identity'
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    #Relationships
    mine_detail = db.relationship(
        'MineDetail',
        backref='mine_identity',
        order_by='desc(MineDetail.update_timestamp)',
        lazy='joined')
    mgr_appointment = db.relationship(
        'MgrAppointment',
        backref='mine_identity',
        order_by='desc(MgrAppointment.update_timestamp)',
        lazy='joined')
    mineral_tenure_xref = db.relationship(
        'MineralTenureXref', backref='mine_identity', lazy='joined')
    mine_location = db.relationship(
        'MineLocation',
        backref='mine_identity',
        order_by='desc(MineLocation.update_timestamp)',
        lazy='joined')
    mine_permit = db.relationship(
        'Permit',
        backref='mine_identity',
        order_by='desc(Permit.issue_date)',
        lazy='joined')
    mine_status = db.relationship(
        'MineStatus',
        backref='mine_identity',
        order_by='desc(MineStatus.update_timestamp)',
        lazy='joined')
    mine_tailings_storage_facilities = db.relationship(
        'MineTailingsStorageFacility',
        backref='mine_identity',
        order_by=
        'desc(MineTailingsStorageFacility.mine_tailings_storage_facility_name)',
        lazy='joined')
    mine_expected_documents = db.relationship(
        'MineExpectedDocument',
        primaryjoin=
        "and_(MineExpectedDocument.mine_guid == MineIdentity.mine_guid, MineExpectedDocument.active_ind==True)",
        backref='mine_identity',
        order_by='desc(MineExpectedDocument.due_date)',
        lazy='joined')
    mine_type = db.relationship(
        'MineType',
        backref='mine_identity',
        order_by='desc(MineType.update_timestamp)',
        lazy='joined')

    mine_party_appts = db.relationship(
        'MinePartyAppointment',
        backref='mine',
        order_by='desc(MinePartyAppointment.start_date)',
        lazy='joined')

    def __repr__(self):
        return '<MineIdentity %r>' % self.mine_guid

    def json(self):
        return {
            'guid':
            str(self.mine_guid),
            'mgr_appointment': [item.json() for item in self.mgr_appointment],
            'mineral_tenure_xref':
            [item.json() for item in self.mineral_tenure_xref],
            'mine_detail': [item.json() for item in self.mine_detail],
            'mine_location': [item.json() for item in self.mine_location],
            'mine_permit': [item.json() for item in self.mine_permit],
            'mine_status': [item.json() for item in self.mine_status],
            'mine_tailings_storage_facility':
            [item.json() for item in self.mine_tailings_storage_facilities],
            'mine_expected_documents':
            [item.json() for item in self.mine_expected_documents],
            'mine_type': [item.json() for item in self.mine_type],
            #'mine_party_appts': [item.json() for item in self.mine_type]
        }

    def json_for_map(self):
        return {
            'guid': str(self.mine_guid),
            'mine_detail': [item.json() for item in self.mine_detail],
            'mine_location': [item.json() for item in self.mine_location]
        }

    def json_by_name(self):
        mine_detail = self.mine_detail[0] if self.mine_detail else None
        return {
            'guid': str(self.mine_guid),
            'mine_name': mine_detail.mine_name if mine_detail else '',
            'mine_no': mine_detail.mine_no if mine_detail else ''
        }

    def json_by_location(self):
        mine_location = self.mine_location[0] if self.mine_location else None
        return {
            'guid': str(self.mine_guid),
            'latitude': str(mine_location.latitude) if mine_location else '',
            'longitude': str(mine_location.longitude) if mine_location else ''
        }

    def json_by_permit(self):
        return {
            'guid': str(self.mine_guid),
            'mine_permit': [item.json() for item in self.mine_permit]
        }

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.join(
            cls.mine_detail, aliased=True).filter_by(mine_no=_id).first()

    @classmethod
    def find_by_mine_no_or_guid(cls, _id):
        result = cls.find_by_mine_guid(_id)
        if result is None:
            result = cls.find_by_mine_no(_id)

        return result

    @classmethod
    def create_mine_identity(cls, user_kwargs, save=True):
        mine_identity = cls(mine_guid=uuid.uuid4(), **user_kwargs)
        if save:
            mine_identity.save(commit=False)
        return mine_identity
