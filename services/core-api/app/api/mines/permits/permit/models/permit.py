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

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.constants import *


class Permit(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit'
    _edit_groups = [PERMIT_EDIT_GROUP]
    _edit_key = PERMIT_EDIT_GROUP

    permit_id = db.Column(db.Integer, primary_key=True)
    permit_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    permit_no = db.Column(db.String(16), nullable=False)
    permit_status_code = db.Column(
        db.String(2), db.ForeignKey('permit_status_code.permit_status_code'))
    project_id = db.Column(db.String)
    _all_permit_amendments = db.relationship(
        'PermitAmendment',
        backref='permit',
        primaryjoin=
        'and_(PermitAmendment.permit_id == Permit.permit_id, PermitAmendment.deleted_ind==False)',
        order_by='desc(PermitAmendment.issue_date), desc(PermitAmendment.permit_amendment_id)',
        lazy='select')

    _all_mines = db.relationship('Mine', lazy='select', secondary='mine_permit_xref')

    permittee_appointments = db.relationship(
        'MinePartyAppointment',
        lazy='select',
        order_by=
        'desc(MinePartyAppointment.start_date), desc(MinePartyAppointment.mine_party_appt_id)')
    permit_status = db.relationship('PermitStatusCode', lazy='select')
    permit_status_code_description = association_proxy('permit_status', 'description')

    bonds = db.relationship(
        'Bond', lazy='select', secondary='bond_permit_xref', order_by='desc(Bond.issue_date)')
    reclamation_invoices = db.relationship('ReclamationInvoice', lazy='select')

    _mine_associations = db.relationship('MinePermitXref')

    # _context_mine allows a Permit() to be used thouugh it only belongs to that mine.
    # legacy data has permits used by multiple mines, but at access time, our application
    # should behave like permits only belong to one mine. If this is not set, many helper methods
    # will fail. Any implicit instantiation of Permit() should set this where possible.
    _context_mine = None

    def __repr__(self):
        return '<Permit %r, %r>' % (self.permit_id, self.permit_guid)

    @hybrid_property
    def current_permittee(self):
        if len(self.permittee_appointments) > 0:
            return self.permittee_appointments[0].party.name
        else:
            return ""

    @hybrid_property
    def permit_amendments(self):
        if not self._context_mine:
            raise Exception('this getter is only available if _context_mine has been set')
        return [
            pa for pa in self._all_permit_amendments if pa.mine_guid == self._context_mine.mine_guid
        ]

    @hybrid_property
    def mine_guid(self):
        if not self._context_mine:
            raise Exception('this getter is only available if _context_mine has been set')
        return self._context_mine.mine_guid

    @hybrid_property
    def mine(self):
        if not self._context_mine:
            raise Exception('this getter is only available if _context_mine has been set')
        return self._context_mine

    @hybrid_property
    def assessed_liability_total(self):
        return sum([
            pa.security_adjustment for pa in self._all_permit_amendments if pa.security_adjustment
        ])

    @hybrid_property
    def confiscated_bond_total(self):
        return sum([b.amount for b in self.bonds if b.amount and b.bond_status_code == "CON"])

    @hybrid_property
    def active_bond_total(self):
        return sum([b.amount for b in self.bonds if b.amount and b.bond_status_code == "ACT"])

    def get_amendments_by_mine_guid(self, mine_guid):
        return [pa for pa in self._all_permit_amendments if pa.mine_guid == mine_guid]

    def delete(self):
        if self.bonds:
            raise Exception('Unable to delete permit with attached bonds.')
        if self.permit_amendments:
            for amendment in self.permit_amendments:
                amendment.delete()
        super(Permit, self).delete()

    @classmethod
    def find_by_permit_guid(cls, _id, mine_guid=None):
        pmt = cls.query.filter_by(permit_guid=_id, deleted_ind=False).first()
        if pmt and mine_guid:
            pmt._context_mine = [m for m in pmt._all_mines if str(m.mine_guid) == str(mine_guid)][0]
        return pmt

    @classmethod
    def find_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id, deleted_ind=False).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(
            mine_guid=_id, deleted_ind=False).filter(cls.permit_status_code != 'D').all()

    @classmethod
    def find_by_permit_no(cls, _permit_no):
        return cls.query.filter_by(
            permit_no=_permit_no, deleted_ind=False).filter(cls.permit_status_code != 'D').first()

    @classmethod
    def find_by_permit_no_all(cls, _permit_no):
        return cls.query.filter_by(
            permit_no=_permit_no, deleted_ind=False).filter(cls.permit_status_code != 'D').all()

    @classmethod
    def find_by_permit_guid_or_no(cls, _permit_guid_or_no):
        result = cls.find_by_permit_guid(_permit_guid_or_no)
        if not result:
            result = cls.find_by_permit_no(_permit_guid_or_no)
        return result

    @classmethod
    def find_by_now_application_guid(cls, _now_application_guid):
        permit_amendment = PermitAmendment.find_by_now_application_guid(_now_application_guid)
        if permit_amendment is not None:
            permit = permit_amendment.permit
            permit._context_mine = permit_amendment.mine
            return permit
        return None

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
