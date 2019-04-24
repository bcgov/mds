import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from ....documents.variances.models.variance import VarianceDocument


class Variance(AuditMixin, Base):
    __tablename__ = "variance"
    variance_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    compliance_article_id = db.Column(
        db.Integer,
        db.ForeignKey('compliance_article.compliance_article_id'),
        nullable=False,
        server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    note = db.Column(db.String, nullable=False, server_default=FetchedValue())
    issue_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    received_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    documents = db.relationship('MineDocument', lazy='joined', secondary='variance_document_xref')

    def __repr__(self):
        return '<Variance %r>' % self.variance_id

    @classmethod
    def create(
            cls,
            compliance_article_id,
            mine_guid,
            # Optional Params
            note=None,
            issue_date=None,
            received_date=None,
            expiry_date=None,
            add_to_session=True):
        new_variance = cls(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            note=note,
            issue_date=issue_date,
            received_date=received_date,
            expiry_date=expiry_date)
        if add_to_session:
            new_variance.save(commit=False)
        return new_variance

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(mine_guid=mine_guid).all()
        except ValueError:
            return None

    @classmethod
    def find_by_variance_id(cls, variance_id):
        return cls.query.filter_by(variance_id=variance_id).first()

    @validates('mine_guid')
    def validate_mine_guid(self, key, mine_guid):
        if not mine_guid:
            raise AssertionError('Missing mine_guid')
        try:
            uuid.UUID(mine_guid, version=4)
        except ValueError:
            raise AssertionError('Invalid mine_guid')
        return mine_guid
