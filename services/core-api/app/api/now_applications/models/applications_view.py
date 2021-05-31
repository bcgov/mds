from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from flask import current_app

from app.api.utils.models_mixins import Base
from app.extensions import db
from .now_application import NOWApplication


class ApplicationsView(Base):
    __tablename__ = 'applications_view'

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    now_application_id = db.Column(db.Integer)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')
    mine_no = db.Column(db.String)
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')
    source_permit_amendment_id = db.Column(db.Integer,
                                           db.ForeignKey('permit_amendment.permit_amendment_id'))
    source_permit_amendment_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_id'))

    source_permit_amendment_issue_date = db.Column(db.Date)

    now_number = db.Column(db.String)

    lead_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    lead_inspector_name = db.Column(db.String)

    issuing_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    issuing_inspector_name = db.Column(db.String)

    notice_of_work_type_description = db.Column(db.String)
    now_application_status_description = db.Column(db.String)

    received_date = db.Column(db.Date)
    originating_system = db.Column(db.String)
    application_type_code = db.Column(db.String)
    now_application_status_code = db.Column(db.String)
    decision_date = db.Column(db.DateTime)
    source_permit_no = db.Column(db.String)

    is_historic = db.Column(db.Boolean)

    import_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    submission_documents = db.relationship(
        'Document',
        lazy='selectin',
        secondary=
        'join(NOWApplicationIdentity, Document, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        primaryjoin=
        'and_(ApplicationsView.now_application_guid==NOWApplicationIdentity.now_application_guid, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        secondaryjoin='foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid)',
        viewonly=True)

    documents = db.relationship(
        'NOWApplicationDocumentXref',
        lazy='selectin',
        primaryjoin=
        'and_(foreign(NOWApplicationDocumentXref.now_application_id)==ApplicationsView.now_application_id, NOWApplicationDocumentXref.now_application_review_id==None)',
        order_by='desc(NOWApplicationDocumentXref.create_timestamp)')

    permit_amendments = db.relationship(
        'PermitAmendment',
        lazy='select',
        primaryjoin=
        'and_(foreign(PermitAmendment.now_application_guid)==ApplicationsView.now_application_guid )'
    )

    application_reason_codes = db.relationship(
        'ApplicationReasonCode',
        lazy='selectin',
        primaryjoin=
        'and_(foreign(ApplicationReasonXref.now_application_id)==ApplicationsView.now_application_id)',
        secondary=
        'join(ApplicationReasonXref, ApplicationReasonCode, foreign(ApplicationReasonXref.application_reason_code)==remote(ApplicationReasonCode.application_reason_code))',
        secondaryjoin=
        'foreign(ApplicationReasonXref.application_reason_code)==remote(ApplicationReasonCode.application_reason_code)',
        viewonly=True)

    contacts = db.relationship(
        'NOWPartyAppointment',
        lazy='selectin',
        primaryjoin=
        'and_(foreign(NOWPartyAppointment.now_application_id) == ApplicationsView.now_application_id, NOWPartyAppointment.deleted_ind==False)',
        secondary=
        'join(NOWPartyAppointment, Party, foreign(NOWPartyAppointment.party_guid)==remote(Party.party_guid))',
        secondaryjoin='foreign(NOWPartyAppointment.party_guid)==remote(Party.party_guid)',
    )

    def __repr__(self):
        return '<ApplicationsView %r>' % self.now_application_guid

    @hybrid_property
    def permittee(self):
        # this check is for performance reason, NOWs do not display permittees
        if self.application_type_code == 'NOW':
            return None

        permittees = [
            contact.party for contact in self.contacts if contact.mine_party_appt_type_code == 'PMT'
        ]

        return permittees[0] if permittees else None

    @hybrid_property
    def permit_amendment(self):
        return self.permit_amendments[0] if self.permit_amendments else None

    @hybrid_property
    def application_documents(self):
        now_application = NOWApplication.find_by_application_guid(self.now_application_guid)
        filtered_submissions_documents = NOWApplication.get_filtered_submissions_documents(
            now_application)
        application_documents = [
            doc for doc in filtered_submissions_documents
            if doc['filename'] == 'ApplicationForm.pdf'
        ]
        return application_documents
