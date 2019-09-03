from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class Permit(AuditMixin, Base):
    __tablename__ = 'permit'
    permit_id = db.Column(db.Integer, primary_key=True)
    permit_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    permit_no = db.Column(db.String(16), nullable=False)
    permit_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))
    permit_status_code_relationship = db.relationship('PermitStatusCode', lazy='select')
    permit_amendments = db.relationship(
        'PermitAmendment',
        backref='permit',
        primaryjoin=
        "and_(PermitAmendment.permit_id == Permit.permit_id, PermitAmendment.deleted_ind==False)",
        order_by='desc(PermitAmendment.issue_date), desc(PermitAmendment.permit_amendment_id)',
        lazy='select')

    mine_party_appointment = db.relationship('MinePartyAppointment', lazy='select', uselist=False)
    permit_status_code_description = association_proxy('permit_status_code_relationship',
                                                       'description')
    permitee = association_proxy('mine_party_appointment', 'party.name')
    mine_name = association_proxy('mine', 'mine_name')

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).all()

    @classmethod
    def find_by_permit_no(cls, _permit_no):
        return cls.query.filter_by(permit_no=_permit_no).first()

    @classmethod
    def find_by_permit_guid_or_no(cls, _permit_guid_or_no):
        result = cls.find_by_permit_guid(_permit_guid_or_no)
        if not result:
            result = cls.find_by_permit_no(_permit_guid_or_no)
        return result

    @classmethod
    def create(cls, mine_guid, permit_no, permit_status_code, add_to_session=True):
        mine_permit = cls(
            mine_guid=mine_guid, permit_no=permit_no, permit_status_code=permit_status_code)
        if add_to_session:
            mine_permit.save(commit=False)
        return mine_permit

    @validates('permit_status_code')
    def validate_status_code(self, key, permit_status_code):
        if not permit_status_code:
            raise AssertionError('Permit status code is not provided.')
        if len(permit_status_code) > 2:
            raise AssertionError('Permit status code is invalid.')
        return permit_status_code

    @validates('permit_no')
    def validate_permit_no(self, key, permit_no):
        if not permit_no:
            raise AssertionError('Permit number is not provided.')
        if len(permit_no) > 16:
            raise AssertionError('Permit number must not exceed 16 characters.')
        return permit_no