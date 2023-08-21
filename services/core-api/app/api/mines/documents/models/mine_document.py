import random
import uuid

from app.api.utils.include.user_info import User

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields
from app.config import Config

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.ext.hybrid import hybrid_property


class MineDocument(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document'

    class _ModelSchema(Base._ModelSchema):
        document_class = fields.String(dump_only=True)
        upload_date = fields.Date(dump_only=True)

    mine_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_id = db.Column(
        db.Integer, nullable=False, unique=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    document_manager_guid = db.Column(UUID(as_uuid=True))
    document_name = db.Column(db.String(255), nullable=False)
    document_date = db.Column(db.DateTime)
    document_class = db.Column(db.String)
    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)

    is_archived = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    archived_date = db.Column(db.DateTime, nullable=True)
    archived_by = db.Column(db.String(60))

    versions = db.relationship('MineDocumentVersion', lazy='joined')

    major_mine_application_document_xref = db.relationship(
        'MajorMineApplicationDocumentXref',
        lazy='select',
        uselist=False,
        primaryjoin='and_(MajorMineApplicationDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == True)'
    )
    project_summary_document_xref = db.relationship(
        'ProjectSummaryDocumentXref',
        lazy='select',
        uselist=False,
        primaryjoin='and_(ProjectSummaryDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == True)'
    )
    project_decision_package_document_xref = db.relationship(
        'ProjectDecisionPackageDocumentXref',
        lazy='select',
        uselist=False,
        primaryjoin='and_(ProjectDecisionPackageDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == True)'
    )
    information_requirements_table_document_xref = db.relationship(
        'InformationRequirementsTableDocumentXref',
        lazy='select',
        uselist=False,
        primaryjoin='and_(InformationRequirementsTableDocumentXref.mine_document_guid == MineDocument.mine_document_guid, MineDocument.is_archived == True)'
    )

    mine_name = association_proxy('mine', 'mine_name')

    __mapper_args__ = {'polymorphic_on': document_class}

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter_by(mine_document_guid=mine_document_guid).filter_by(
            deleted_ind=False).first()

    @classmethod
    def _mine_document_by_guids_qs(cls, mine_document_guids):
        return cls.query\
            .filter(cls.mine_document_guid.in_(mine_document_guids)) \
            .filter_by(deleted_ind=False) \


    @classmethod
    def find_by_mine_document_guid_many(cls, mine_document_guids):
        return cls._mine_document_by_guids_qs(mine_document_guids).all()

    @classmethod
    def mark_as_archived_many(cls, mine_document_guids):
        cls._mine_document_by_guids_qs(mine_document_guids) \
            .update({
                'is_archived': True,
                'archived_date': datetime.utcnow(),
                'archived_by': User().get_user_username(),
            }, synchronize_session='fetch')
        db.session.commit()

    # TODO: Remove when mine_party_appt is refactored

    def json(self):
        return {
            'mine_document_guid': str(self.mine_document_guid),
            'mine_guid': str(self.mine_guid),
            'document_manager_guid': str(self.document_manager_guid),
            'document_name': self.document_name,
            'create_user': self.create_user,
            'is_archived': self.is_archived,
            'archived_date': self.archived_date,
            'archived_by': self.archived_by,
            'upload_date': str(self.upload_date),
            'versions': self.versions or [],
        }
