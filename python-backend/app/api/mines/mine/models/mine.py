from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineIdentity(AuditMixin, Base):
    __tablename__ = 'mine_identity'
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_detail = db.relationship('MineDetail', backref='mine_identity', order_by='desc(MineDetail.update_timestamp)', lazy='joined')
    mgr_appointment = db.relationship('MgrAppointment', backref='mine_identity', order_by='desc(MgrAppointment.update_timestamp)', lazy='joined')
    mineral_tenure_xref = db.relationship('MineralTenureXref', backref='mine_identity', lazy='joined')
    mine_location = db.relationship('MineLocation', backref='mine_identity', order_by='desc(MineLocation.update_timestamp)', lazy='joined')
    mine_permit = db.relationship('Permit', backref='mine_identity', order_by='desc(Permit.issue_date)', lazy='joined')
    mine_status = db.relationship('MineStatus', backref='mine_status', order_by='desc(MineStatus.update_timestamp)', lazy='joined')
    mine_tailings_storage_facility = db.relationship('MineTailingsStorageFacility', backref='mine_tailings_storage_facility', order_by='desc(MineTailingsStorageFacility.mine_tailings_storage_facility_name)', lazy='joined')
    mine_expected_documents = db.relationship('MineExpectedDocument', backref='mine_expected_documents', order_by='desc(MineExpectedDocument.date_created)', lazy='joined')              
    mine_region = db.relationship('MineRegion',backref='mine_identity',order_by='desc(MineRegion.update_timestamp)', lazy='joined')

    def __repr__(self):
        return '<MineIdentity %r>' % self.mine_guid

    def json(self):
        return {
            'guid': str(self.mine_guid),
            'mgr_appointment': [item.json() for item in self.mgr_appointment],
            'mineral_tenure_xref': [item.json() for item in self.mineral_tenure_xref],
            'mine_detail': [item.json() for item in self.mine_detail],
            'mine_location': [item.json() for item in self.mine_location],
            'mine_permit': [item.json() for item in self.mine_permit],
            'mine_status': [item.json() for item in self.mine_status],
            'mine_region': [item.json() for item in self.mine_region],
            'mine_tailings_storage_facility': [item.json() for item in self.mine_tailings_storage_facility],
            'mine_expected_documents':[item.json() for item in self.mine_expected_documents]
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
        return cls.query.join(cls.mine_detail, aliased=True).filter_by(mine_no=_id).first()

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


class MineDetail(AuditMixin, Base):
    __tablename__ = "mine_detail"
    mine_detail_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)
    mine_note = db.Column(db.String(300), default='')
    major = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return '<MineDetail %r>' % self.mine_guid

    def json(self):
        return {
            'mine_name': self.mine_name,
            'mine_no': self.mine_no,
            'mine_note': self.mine_note,
            'major': self.major
            }

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).first()

    @classmethod
    def create_mine_detail(cls, mine_identity, mine_no, mine_name, user_kwargs, save=True):
        mine_detail = cls(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            mine_no=mine_no,
            mine_name=mine_name,
            **user_kwargs
        )
        if save:
            mine_detail.save(commit=False)
        return mine_detail

    @validates('mine_name')
    def validate_mine_name(self, key, mine_name):
        if not mine_name:
            raise AssertionError('No mine name provided.')
        if len(mine_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        return mine_name

    @validates('mine_note')
    def validate_mine_note(self, key, mine_note):
        if len(mine_note) > 300:
            raise AssertionError('Mine note must not exceed 300 characters.')
        return mine_note

    @validates('mine_no')
    def validate_mine_no(self, key, mine_no):
        if len(mine_no) > 10:
            raise AssertionError('Mine number must not exceed 10 characters.')
        return mine_no


class MineralTenureXref(AuditMixin, Base):
    __tablename__ = "mineral_tenure_xref"
    mineral_tenure_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    tenure_number_id = db.Column(db.Numeric(10), unique=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineralTenureXref %r>' % self.tenure_number_id

    def json(self):
        return {'tenure_number_id': str(self.tenure_number_id)}

    @classmethod
    def find_by_tenure(cls, _id):
        return cls.query.filter_by(tenure_number_id=_id).first()

    @classmethod
    def create_mine_tenure(cls, mine_identity, tenure_number_id, user_kwargs, save=True):
        mine_tenure = cls(
            mineral_tenure_xref_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            tenure_number_id=tenure_number_id,
            **user_kwargs
        )
        if save:
            mine_tenure.save(commit=False)
        return mine_tenure

    @validates('tenure_number_id')
    def validate_tenure_number_id(self, key, tenure_number_id):
        if len(str(tenure_number_id)) not in [6, 7]:
            raise AssertionError('Tenure number must be 6 or 7 digits long.')
        return tenure_number_id
