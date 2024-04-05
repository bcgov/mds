import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.include.user_info import User
from .variance_application_status_code import VarianceApplicationStatusCode
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.variances.models.variance_document_xref import VarianceDocumentXref

from app.api.services.email_service import EmailService
from app.config import Config
from app.api.constants import VARIANCE_APPLICATION_EMAIL, MDS_EMAIL

INVALID_GUID = 'Invalid guid.'
INVALID_MINE_GUID = 'Invalid mine_guid.'
INVALID_APPLICANT_GUID = 'Invalid applicant_guid.'
INVALID_VARIANCE_GUID = 'Invalid variance_guid.'
MISSING_MINE_GUID = 'Missing mine_guid.'


class Variance(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "variance"
    variance_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    variance_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    variance_no = db.Column(db.Integer, nullable=False, server_default=FetchedValue())
    compliance_article_id = db.Column(
        db.Integer,
        db.ForeignKey('compliance_article.compliance_article_id'),
        nullable=False,
        server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    applicant_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    variance_application_status_code = db.Column(
        db.String,
        db.ForeignKey('variance_application_status_code.variance_application_status_code'),
        nullable=False,
        server_default=FetchedValue())
    inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    note = db.Column(db.String, nullable=False, server_default=FetchedValue())
    parties_notified_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    issue_date = db.Column(db.DateTime)
    received_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime)

    created_by = db.Column(db.String, default=User().get_user_username)
    created_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    updated_by = db.Column(db.String, default=User().get_user_username)
    updated_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # please note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('VarianceDocumentXref', lazy='joined')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='joined',
        secondary='variance_document_xref',
        secondaryjoin=
        'and_(foreign(VarianceDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)',
        overlaps="mine_document,documents"
    )
    inspector = db.relationship('Party', lazy='joined', foreign_keys=[inspector_party_guid])
    mine = db.relationship('Mine', lazy='joined')

    mine_name = association_proxy('mine', 'mine_name')

    def __repr__(self):
        return '<Variance %r>' % self.variance_id

    def save(self, commit=True):
        self.updated_by = User().get_user_username()
        self.updated_timestamp = datetime.utcnow()
        super(Variance, self).save(commit)

    def delete(self):
        if self.mine_documents:
            for document in self.mine_documents:
                document.deleted_ind = True
        super(Variance, self).delete()

    @classmethod
    def create(
            cls,
            compliance_article_id,
            mine_guid,
            received_date,
                                                                               # Optional Params
            applicant_guid=None,
            variance_application_status_code=None,
            inspector_party_guid=None,
            note=None,
            parties_notified_ind=None,
            issue_date=None,
            expiry_date=None,
            add_to_session=True):
        new_variance = cls(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            variance_application_status_code=variance_application_status_code,
            applicant_guid=applicant_guid,
            inspector_party_guid=inspector_party_guid,
            note=note,
            parties_notified_ind=parties_notified_ind,
            issue_date=issue_date,
            received_date=received_date,
            expiry_date=expiry_date,
            created_by=User().get_user_username(),
            created_timestamp=datetime.utcnow())
        if add_to_session:
            new_variance.save(commit=False)
        return new_variance

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        cls.validate_guid(mine_guid, INVALID_MINE_GUID)
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def find_by_variance_id(cls, variance_id):
        return cls.query.filter_by(variance_id=variance_id, deleted_ind=False).first()

    @classmethod
    def find_by_variance_guid(cls, variance_guid):
        cls.validate_guid(variance_guid, INVALID_VARIANCE_GUID)
        return cls.query.filter_by(variance_guid=variance_guid, deleted_ind=False).first()

    @classmethod
    def find_by_mine_guid_and_variance_guid(cls, mine_guid, variance_guid):
        cls.validate_guid(mine_guid, INVALID_MINE_GUID)
        cls.validate_guid(variance_guid, INVALID_VARIANCE_GUID)
        return cls.query.filter_by(
            mine_guid=mine_guid, variance_guid=variance_guid, deleted_ind=False).first()

    @classmethod
    def validate_guid(cls, guid, msg=INVALID_GUID):
        try:
            uuid.UUID(str(guid), version=4)
        except ValueError:
            raise AssertionError(msg)

    @classmethod
    def validate_status_with_other_values(cls, status, expiry, issue, inspector):
        if status == 'APP':
            if expiry is None:
                raise AssertionError('Expiry date required for approved variance.')
            if issue is None:
                raise AssertionError('Issue date required for approved variance.')
            if inspector is None:
                raise AssertionError('Inspector required for approved variance.')

        if status == 'DEN':
            if inspector is None:
                raise AssertionError('Inspector required for reviewed variance.')

        if status in ['REV', 'NAP', 'DEN']:
            if expiry is not None:
                raise AssertionError('Expiry date forbidden unless variance is approved.')
            if issue is not None:
                raise AssertionError('Issue date forbidden unless variance is approved.')

    @validates('mine_guid')
    def validate_mine_guid(self, key, mine_guid):
        if not mine_guid:
            raise AssertionError(MISSING_MINE_GUID)
        self.validate_guid(mine_guid, INVALID_MINE_GUID)
        return mine_guid

    @validates('applicant_guid')
    def validate_applicant_guid(self, key, applicant_guid):
        if applicant_guid:
            self.validate_guid(applicant_guid, INVALID_APPLICANT_GUID)
        return applicant_guid

    def send_variance_application_email(self):
        recipients = [VARIANCE_APPLICATION_EMAIL, MDS_EMAIL]

        status_code = VarianceApplicationStatusCode.query.get(self.variance_application_status_code)

        subject = f'Variance Notification for for {self.mine.mine_name}'
        body = f'<p>{self.mine.mine_name} (Mine no: {self.mine.mine_no}) has requested a Variance in MineSpace.</p>'
        body += f'<p><b>Part of Code: </b>{status_code.description}</p>'
        body += f'<p><b>Submission Date: </b>{self.received_date}</p>'
        body += f'<p><b>Description: </b>{self.note}</p>'
        body += f'<p><b>Applied for By: </b>{self.created_by}</p>'

        link = f'{Config.CORE_PROD_URL}/mine-dashboard/{self.mine.mine_guid}/permits-and-approvals/variances/'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)
