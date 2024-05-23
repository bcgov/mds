from datetime import datetime, date

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.verifiable_credentials.aries_constants import IssueCredentialIssuerState

from . import permit_amendment_status_code, permit_amendment_type_code
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.constants import *


class PermitAmendment(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_amendment'
    _edit_groups = [PERMIT_EDIT_GROUP, PERMIT_AMENDMENT_EDIT_GROUP]
    _edit_key = PERMIT_AMENDMENT_EDIT_GROUP

    permit_amendment_id = db.Column(db.Integer, primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_amendment_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'), nullable=False)
    received_date = db.Column(db.DateTime, nullable=False)
    issue_date: datetime = db.Column(db.DateTime, nullable=False)
    authorization_end_date = db.Column(db.DateTime, nullable=False)
    permit_amendment_status_code = db.Column(
        db.String(3), db.ForeignKey('permit_amendment_status_code.permit_amendment_status_code'))
    permit_amendment_type_code = db.Column(
        db.String(3), db.ForeignKey('permit_amendment_type_code.permit_amendment_type_code'))
    description = db.Column(db.String)
    issuing_inspector_title = db.Column(db.String)
    regional_office = db.Column(db.String)
    preamble_text = db.Column(db.String, nullable=True)

    permit_amendment_status = db.relationship('PermitAmendmentStatusCode')
    permit_amendment_status_description = association_proxy('permit_amendment_status',
                                                            'description')
    permit_guid = association_proxy('permit', 'permit_guid')
    permit_no = association_proxy('permit', 'permit_no')
    permit_amendment_type = db.relationship('PermitAmendmentTypeCode')
    permit_amendment_type_description = association_proxy('permit_amendment_type', 'description')
    #liability_adjustment is the change of work assessed for the new amendment,
    # This value is added to previous amendments to create the new total assessment for the permit
    liability_adjustment = db.Column(db.Numeric(16, 2))
    security_received_date = db.Column(db.DateTime)
    security_not_required = db.Column(db.Boolean)
    security_not_required_reason = db.Column(db.String)
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
    now_identity = db.relationship(
        'NOWApplicationIdentity', lazy='select', foreign_keys=[now_application_guid])
    mine = db.relationship('Mine', lazy='select', back_populates='_mine_permit_amendments')
    conditions = db.relationship(
        'PermitConditions',
        lazy='select',
        primaryjoin=
        "and_(PermitConditions.permit_amendment_id == PermitAmendment.permit_amendment_id, PermitConditions.deleted_ind == False, PermitConditions.parent_permit_condition_id.is_(None))",
        order_by='asc(PermitConditions.display_order)',
        back_populates='permit_amendment')
    permit_conditions_last_updated_date = db.Column(db.DateTime)
    permit_conditions_last_updated_by = db.Column(db.String(60))
    is_generated_in_core = db.Column(db.Boolean)

    #no current use case for this relationship
    #TODO Have factories use this to manage FK.
    mine_permit_xref = db.relationship(
        'MinePermitXref',
        uselist=False,
        primaryjoin=
        "and_(PermitAmendment.mine_guid==foreign(MinePermitXref.mine_guid), PermitAmendment.permit_id==foreign(MinePermitXref.permit_id))",
        overlaps='mine')
    all_mine_permit_xref = db.relationship(
        'MinePermitXref',
        primaryjoin="PermitAmendment.permit_id==foreign(MinePermitXref.permit_id)",
        overlaps='mine_permit_xref')

    now_application_identity = db.relationship(
        'NOWApplicationIdentity',
        lazy='selectin',
        uselist=False,
        foreign_keys=[now_application_guid],
        overlaps='now_identity')

    vc_credential_exch = db.relationship(
        'PartyVerifiableCredentialMinesActPermit',
        lazy='selectin',
        order_by='desc(PartyVerifiableCredentialMinesActPermit.update_timestamp)')
    mines_act_permit_vc_locked = association_proxy("permit", 'mines_act_permit_vc_locked')

    @hybrid_property
    def issuing_inspector_name(self):
        title = "Inspector of Mines"

        #with i had null propagation
        now_identity = self.now_identity
        if now_identity:
            now_application = now_identity.now_application
            if now_application:
                issuing_inspector = now_application.issuing_inspector
                if issuing_inspector:
                    return issuing_inspector.party_name

        used_by_major_mine = any([m.mine.major_mine_ind for m in self.all_mine_permit_xref])
        if used_by_major_mine:
            if self.issue_date >= date(2020, 7, 17):
                return 'Chief Permitting Officer'
            else:
                return 'Chief Inspector of Mines'
        return title

    @hybrid_property
    def now_application_documents(self):
        _now_app_docs = []
        if self.now_application_identity:
            _now_app_docs = self.now_application_identity.now_application.documents
        return _now_app_docs

    @hybrid_property
    def imported_now_application_documents(self):
        _imported_now_app_docs = []
        if self.now_application_identity:
            _imported_now_app_docs = self.now_application_identity.now_application.imported_submission_documents
        return _imported_now_app_docs

    @hybrid_property
    def has_permit_conditions(self):
        permit_conditions = PermitConditions.query.filter_by(
            permit_amendment_id=self.permit_amendment_id,
            parent_permit_condition_id=None,
            deleted_ind=False).count()
        return permit_conditions > 0

    @hybrid_property
    def vc_credential_exch_state(self):
        # TODO this assumes only one active credential for each mines act permit
        # this will need to be revisited to support additional issuances (wallet recovery) or multple schemas issued

        active = [
            x for x in self.vc_credential_exch
            if x.cred_exch_state in IssueCredentialIssuerState.active_credential_states
        ]

        if active:
            #if any active, return most recent
            return active[0].cred_exch_state
        else:
            return self.vc_credential_exch[0].cred_exch_state if len(
                self.vc_credential_exch) > 0 else None

    def __repr__(self):
        return '<PermitAmendment %r, %r>' % (self.mine_guid, self.permit_id)

    def delete(self, is_force_delete=False):
        if not is_force_delete and self.permit_amendment_type_code == 'OGP':
            raise Exception(
                "Deletion of permit amendment of type 'Original Permit' is not allowed. Consider deleting the permit itself."
            )

        if self.now_application_guid and self.permit_amendment_status_code != "DFT" and self.is_generated_in_core:
            raise Exception(
                'The permit amendment generated in Core with linked NOW application in Core cannot be deleted.'
            )
        # If deleting a draft permit, remove the now_guid so a new permit can be created and associated with that now
        elif self.now_application_guid and self.permit_amendment_status_code == "DFT":
            self.now_application_guid = None
            self.save()

        if self.conditions and self.permit_amendment_status_code != "DFT" and self.is_generated_in_core:
            raise Exception(
                'The permit amendment generated in Core has permit conditions and cannot be deleted.'
            )
        elif (self.conditions and self.permit_amendment_status_code
              == "DFT") or (self.conditions and not self.is_generated_in_core):
            PermitConditions.delete_all_by_permit_amendment_id(self.permit_amendment_id)
            self.save()

        permit_amendment_documents = PermitAmendmentDocument.query.filter_by(
            permit_amendment_id=self.permit_amendment_id, deleted_ind=False).all()
        if permit_amendment_documents:
            for document in permit_amendment_documents:
                document.delete()

        super(PermitAmendment, self).delete()

    @classmethod
    def create(cls,
               permit,
               mine,
               received_date,
               issue_date,
               authorization_end_date,
               permit_amendment_type_code='AMD',
               description=None,
               liability_adjustment=None,
               permit_amendment_status_code='ACT',
               issuing_inspector_title=None,
               regional_office=None,
               now_application_guid=None,
               security_received_date=None,
               security_not_required=None,
               security_not_required_reason=None,
               is_generated_in_core=False,
               add_to_session=True):
        new_pa = cls(
            permit_id=permit.permit_id,
            mine_guid=mine.mine_guid,
            received_date=received_date,
            issue_date=issue_date,
            authorization_end_date=authorization_end_date,
            permit_amendment_type_code=permit_amendment_type_code,
            permit_amendment_status_code=permit_amendment_status_code
            if not permit.permit_status_code == 'D' else 'DFT',
            description=description,
            liability_adjustment=liability_adjustment,
            issuing_inspector_title=issuing_inspector_title,
            regional_office=regional_office,
            now_application_guid=now_application_guid,
            security_received_date=security_received_date,
            security_not_required=security_not_required,
            security_not_required_reason=security_not_required_reason,
            is_generated_in_core=is_generated_in_core)
        permit._all_permit_amendments.append(new_pa)
        if add_to_session:
            new_pa.save(commit=False)
        return new_pa

    @classmethod
    def find_by_permit_amendment_id(cls, _id):
        return cls.query.filter_by(permit_amendment_id=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_permit_amendment_guid(cls, _guid) -> "PermitAmendment":
        return cls.query.filter_by(permit_amendment_guid=_guid).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id).filter_by(deleted_ind=False).filter(
            cls.permit_amendment_status_code != 'DFT').all()

    @classmethod
    def find_last_amendment_by_permit_id(cls, _id):
        return cls.query.filter_by(permit_id=_id).filter_by(deleted_ind=False).filter(
            cls.permit_amendment_status_code != 'DFT').order_by(
                cls.permit_amendment_id.desc()).first()

    @classmethod
    def find_by_now_application_guid(cls, _id):
        return cls.query.filter_by(now_application_guid=_id).first()

    @classmethod
    def find_original_permit_amendment_by_permit_guid(cls, _guid, mine_guid):
        return cls.query.filter_by(permit_guid=_guid).filter_by(
            permit_amendment_type_code='OGP', mine_guid=mine_guid).first()

    @validates('permit_amendment_status_code')
    def validate_status_code(self, key, permit_amendment_status_code):
        if not permit_amendment_status_code:
            raise AssertionError('Permit amendment status code is not provided.')
        return permit_amendment_status_code

    @validates('permit_amendment_type_code')
    def validate_type_code(self, key, permit_amendment_type_code):
        if not permit_amendment_type_code:
            raise AssertionError('Permit amendment type code is not provided.')
        return permit_amendment_type_code

    @validates('received_date')
    def validate_received_date(self, key, received_date):
        if received_date:
            if received_date.isoformat() == '9999-12-31':
                raise AssertionError(
                    'Permit amendment received date should be set to null if not known.')
            if received_date > datetime.today():
                raise AssertionError('Permit amendment received date cannot be set to the future.')
        return received_date

    @validates('issue_date')
    def validate_issue_date(self, key, issue_date):
        # TODO DO NOT REMOVE NEXT LINE. If this validation removed then exception will be thrown on permit creation/editing:
        # "permit_amendment" violates foreign key constraint "permit_amendment_mine_permit_xref_mine_guid_permit_no_fk"
        # DETAIL:  Key (mine_guid, permit_id)=(28966bf7-8e65-4cc4-b077-b248b6a136ef, 212) is not present in table "mine_permit_xref".
        original_permit_amendment = self.query.filter_by(permit_id=self.permit_id).filter_by(
            permit_amendment_type_code='OGP').first()

        if issue_date:
            if issue_date.isoformat() == '9999-12-31':
                raise AssertionError(
                    'Permit amendment issue date should be set to null if not known.')
            if self.permit_amendment_status_code != 'DFT' and issue_date > datetime.today():
                raise AssertionError('Permit amendment issue date cannot be set to the future.')
        return issue_date

    @validates('authorization_end_date')
    def validate_authorization_end_date(self, key, authorization_end_date):
        if authorization_end_date and authorization_end_date.isoformat() == '9999-12-31':
            raise AssertionError('Permit amendment end date should be set to null if not known.')
        return authorization_end_date

    @validates('description')
    def validate_description(self, key, description):
        if description and len(description) > 280:
            raise AssertionError('Permit amendment description must be 280 characters or fewer.')
        return description
