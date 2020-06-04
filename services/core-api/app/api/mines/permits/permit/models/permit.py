from flask import current_app

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
#for schema creation
from app.api.mines.permits.permit.models.permit_status_code import PermitStatusCode
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.constants import *


class Permit(AuditMixin, Base):
    __tablename__ = 'permit'
    _edit_groups = [PERMIT_EDIT_GROUP]
    _edit_key = PERMIT_EDIT_GROUP

    permit_id = db.Column(db.Integer, primary_key=True)
    permit_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    permit_no = db.Column(db.String(16), nullable=False)
    permit_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))
    _all_permit_amendments = db.relationship(
        'PermitAmendment',
        backref='permit',
        primaryjoin=
        'and_(PermitAmendment.permit_id == Permit.permit_id, PermitAmendment.deleted_ind==False)',
        order_by='desc(PermitAmendment.issue_date), desc(PermitAmendment.permit_amendment_id)',
        lazy='select')

    _all_mines = db.relationship('Mine', lazy='selectin', secondary='mine_permit_xref')

    permittee_appointments = db.relationship(
        'MinePartyAppointment',
        lazy='select',
        order_by=
        'desc(MinePartyAppointment.start_date), desc(MinePartyAppointment.mine_party_appt_id)')
    permit_status = db.relationship('PermitStatusCode', lazy='select')
    permit_status_code_description = association_proxy('permit_status', 'description')

    bonds = db.relationship('Bond', lazy='select', secondary='bond_permit_xref')
    reclamation_invoices = db.relationship('ReclamationInvoice', lazy='select')

    _mine_associations = db.relationship('MinePermitXref')

    @hybrid_property
    def current_permittee(self):
        if len(self.permittee_appointments) > 0:
            return self.permittee_appointments[0].party.name
        else:
            return ""

    @hybrid_property
    def mine(self):
        mine = next(iter(self._all_mines), None)
        if len(self._all_mines) > 1:
            current_app.logger.WARN(
                f'{self.permit_no}.mine returned {mine.mine_no},{mine.mine_name} out of {len(self._all_mines)}'
            )
        return mine

    @mine.setter
    def mine(self, value):
        #factories use this setter. should not be used without
        if len(self._all_mines < 2):
            self._all_mines = [value]
        else:
            raise Exception(
                "Permit is used by multiple mines, cannot override. try mine._all_mines.append()")

    def get_mine(self, mine_guid):
        return next([m for m in self.all_mines if m.mine_guid == mine_guid], None)

    def get_amendments_by_mine_guid(self, mine_guid):
        return [pa for pa in self._all_permit_amendments if pa.mine_guid == mine_guid]

    def __repr__(self):
        return '<Permit %r>' % self.permit_guid

    @classmethod
    def find_by_permit_guid(cls, _id):
        return cls.query.filter_by(permit_guid=_id).first()

    @classmethod
    def find_by_permit_no(cls, _permit_no):
        return cls.query.filter_by(permit_no=_permit_no).first()

    @classmethod
    def find_by_permit_no_all(cls, _permit_no):
        return cls.query.filter_by(permit_no=_permit_no).all()

    @classmethod
    def find_by_permit_guid_or_no(cls, _permit_guid_or_no):
        result = cls.find_by_permit_guid(_permit_guid_or_no)
        if not result:
            result = cls.find_by_permit_no(_permit_guid_or_no)
        return result

    @classmethod
    def create(cls, mine, permit_no, permit_status_code, add_to_session=True):
        permit = cls.find_by_permit_no(permit_no)
        if not permit:
            permit = cls(permit_no=permit_no, permit_status_code=permit_status_code)

        permit._mine_associations.append(MinePermitXref(mine_guid=mine.mine_guid))
        if add_to_session:
            permit.save(commit=False)
        return permit

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
