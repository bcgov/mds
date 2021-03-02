from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db
from .now_application_identity import NOWApplicationIdentity
from app.api.now_submissions.models.document import Document
from datetime import datetime


class NoticeOfWorkView(Base):
    __tablename__ = 'notice_of_work_view'

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')
    mine_no = db.Column(db.String)
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')

    now_number = db.Column(db.String)

    lead_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    lead_inspector_name = db.Column(db.String)

    notice_of_work_type_description = db.Column(db.String)
    now_application_status_description = db.Column(db.String)

    received_date = db.Column(db.Date)
    originating_system = db.Column(db.String)

    is_historic = db.Column(db.Boolean)

    import_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    submission_documents = db.relationship(
        'Document',
        lazy='selectin',
        secondary=
        'join(NOWApplicationIdentity, Document, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        primaryjoin=
        'and_(NoticeOfWorkView.now_application_guid==NOWApplicationIdentity.now_application_guid, foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid))',
        secondaryjoin='foreign(NOWApplicationIdentity.messageid)==remote(Document.messageid)',
        viewonly=True)

    def __repr__(self):
        return '<NoticeOfWorkView %r>' % self.now_application_guid

    @hybrid_property
    def application_documents(self):
        return [doc for doc in self.submission_documents if doc.filename == 'ApplicationForm.pdf']
