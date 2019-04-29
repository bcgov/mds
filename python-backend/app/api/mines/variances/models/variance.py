import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from .variance_application_status_code import VarianceApplicationStatusCode
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
    variance_application_status_code = db.Column(
        db.String,
        db.ForeignKey('variance_application_status_code.variance_application_status_code'),
        nullable=False,
        server_default=FetchedValue())
    ohsc_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    union_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    inspector_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'))
    note = db.Column(db.String, nullable=False, server_default=FetchedValue())
    issue_date = db.Column(db.DateTime)
    received_date = db.Column(db.DateTime, nullable=False)
    expiry_date = db.Column(db.DateTime)

    documents = db.relationship('MineDocument', lazy='joined', secondary='variance_document_xref')

    def __repr__(self):
        return '<Variance %r>' % self.variance_id

    @classmethod
    def create(
            cls,
            compliance_article_id,
            mine_guid,
            received_date,
            # Optional Params
            variance_application_status_code=None,
            ohsc_ind=None,
            union_ind=None,
            note=None,
            issue_date=None,
            expiry_date=None,
            add_to_session=True):
        new_variance = cls(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            variance_application_status_code=variance_application_status_code,
            ohsc_ind=ohsc_ind,
            union_ind=ohsc_ind,
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
            uuid.UUID(str(mine_guid), version=4)
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
            uuid.UUID(str(mine_guid), version=4)
        except ValueError:
            raise AssertionError('Invalid mine_guid')
        return mine_guid
