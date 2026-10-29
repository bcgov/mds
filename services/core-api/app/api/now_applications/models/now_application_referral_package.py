from datetime import datetime
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.exc import IntegrityError
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.mines.documents.models.mine_document import MineDocument


class NOWApplicationReferralPackageDocumentXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_referral_package_document_xref'

    now_application_referral_package_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_application_referral_package_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application_referral_package.now_application_referral_package_id'),
        nullable=False)
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    version_number = db.Column(db.Integer, nullable=False, default=1)
    category = db.Column(db.String(100), nullable=True)
    # When the file captured by this snapshot was uploaded. MineDocumentVersion copies this value
    # when the file is replaced, so it identifies the archived version without relying on list order.
    file_create_timestamp = db.Column(db.DateTime(timezone=True), nullable=True)

    mine_document = db.relationship('MineDocument', lazy='joined')

    def __repr__(self):
        return f'<NOWApplicationReferralPackageDocumentXref {self.now_application_referral_package_document_xref_guid}>'

    @property
    def version_label(self):
        return f'v{self.version_number}'

    @property
    def document_manager_version_guid(self):
        # While the snapshotted file is still the current one, it has no archived version yet.
        if not self.mine_document or not self.file_create_timestamp:
            return None
        for version in self.mine_document.versions:
            if version.create_timestamp == self.file_create_timestamp:
                return str(version.document_manager_version_guid) if version.document_manager_version_guid else None
        return None


class NOWApplicationReferralPackage(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_referral_package'

    now_application_referral_package_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_referral_package_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue())
    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), nullable=False)
    package_order = db.Column(db.Integer, nullable=False)
    package_name = db.Column(db.String(100), nullable=False)

    documents = db.relationship(
        'NOWApplicationReferralPackageDocumentXref',
        backref='referral_package',
        lazy='joined',
        cascade='all, delete-orphan')

    def __repr__(self):
        return f'<NOWApplicationReferralPackage {self.now_application_referral_package_id}>'

    @classmethod
    def find_by_now_application_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id, deleted_ind=False).order_by(
            cls.package_order.desc()).all()

    @classmethod
    def create(cls, now_application, mine_documents, add_to_session=True):
        existing_packages = cls.find_by_now_application_id(now_application.now_application_id)

        # A new package is only recorded when the documents or their versions differ from the latest one.
        if existing_packages:
            latest = existing_packages[0]
            latest_doc_map = {str(d.mine_document_guid): d.version_number for d in latest.documents}
            new_doc_map = {str(md.mine_document_guid): len(md.versions) + 1 for md in mine_documents}
            if latest_doc_map == new_doc_map:
                return latest

        # Retry once if a concurrent save claimed the same package_order (unique constraint).
        for attempt in range(2):
            package = cls._build(now_application, mine_documents)
            if not add_to_session:
                return package
            try:
                package.save(commit=True)
                return package
            except IntegrityError:
                if attempt == 1:
                    raise
        return package

    @classmethod
    def _build(cls, now_application, mine_documents):
        # Deleted packages are included so their numbers are never reused.
        max_order = db.session.query(func.max(cls.package_order)).filter_by(
            now_application_id=now_application.now_application_id).scalar() or 0
        package_order = max_order + 1

        package = cls(
            now_application_id=now_application.now_application_id,
            package_order=package_order,
            package_name=f'Referral Package #{package_order}')

        for mine_doc in mine_documents:
            category = 'Document'
            xref = mine_doc.now_application_document_xref or mine_doc.now_application_document_identity_xref
            if xref:
                if hasattr(xref, 'now_application_document_type') and xref.now_application_document_type:
                    category = xref.now_application_document_type.description
                elif hasattr(xref, 'documenttype') and xref.documenttype:
                    category = xref.documenttype
                elif hasattr(xref, 'now_application_document_sub_type_code') and xref.now_application_document_sub_type_code:
                    category = xref.now_application_document_sub_type_code

            package.documents.append(
                NOWApplicationReferralPackageDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    document_manager_guid=mine_doc.document_manager_guid,
                    document_name=mine_doc.document_name,
                    version_number=len(mine_doc.versions) + 1,
                    file_create_timestamp=mine_doc.create_timestamp,
                    category=category))

        return package
