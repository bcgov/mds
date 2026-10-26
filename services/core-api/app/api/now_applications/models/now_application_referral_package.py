from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
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

    mine_document = db.relationship('MineDocument', lazy='joined')

    def __repr__(self):
        return f'<NOWApplicationReferralPackageDocumentXref {self.now_application_referral_package_document_xref_guid}>'

    @property
    def version_label(self):
        return f'v{self.version_number}'

    @property
    def document_manager_version_guid(self):
        if not self.mine_document:
            return None
        # Sort versions chronologically (version 1, version 2...)
        versions = sorted(
            self.mine_document.versions,
            key=lambda v: (v.create_timestamp or datetime.min, v.mine_document_version_guid)
        )
        if not versions:
            return None
        # Total versions = len(versions) + 1. The current file is version (len(versions) + 1).
        # If this snapshot was for a version earlier than the current file:
        if self.version_number <= len(versions):
            target_ver = versions[self.version_number - 1]
            return str(target_ver.document_manager_version_guid) if target_ver.document_manager_version_guid else None
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
    def create(cls, now_application, mine_document_guids, add_to_session=True):
        existing_packages = cls.find_by_now_application_id(now_application.now_application_id)

        # Prevent duplicate identical package if created within 5 minutes with the same documents
        if existing_packages:
            latest = existing_packages[0]
            if latest.create_timestamp:
                time_diff = (datetime.utcnow() - latest.create_timestamp).total_seconds()
                if time_diff < 300:
                    latest_doc_map = {str(d.mine_document_guid): d.version_number for d in latest.documents}
                    new_doc_map = {}
                    for g in mine_document_guids:
                        md = MineDocument.find_by_mine_document_guid(g)
                        if md:
                            new_doc_map[str(md.mine_document_guid)] = len(md.versions) + 1
                    if latest_doc_map == new_doc_map:
                        return latest

        package_order = len(existing_packages) + 1
        package_name = f'Referral Package #{package_order}'

        package = cls(
            now_application_id=now_application.now_application_id,
            package_order=package_order,
            package_name=package_name)

        if add_to_session:
            package.save(commit=False)

        for mine_doc_guid in mine_document_guids:
            mine_doc = MineDocument.find_by_mine_document_guid(mine_doc_guid)
            if not mine_doc:
                continue

            version_number = len(mine_doc.versions) + 1

            category = 'Document'
            xref = mine_doc.now_application_document_xref or mine_doc.now_application_document_identity_xref
            if xref:
                if hasattr(xref, 'now_application_document_type') and xref.now_application_document_type:
                    category = xref.now_application_document_type.description
                elif hasattr(xref, 'documenttype') and xref.documenttype:
                    category = xref.documenttype
                elif hasattr(xref, 'now_application_document_sub_type_code') and xref.now_application_document_sub_type_code:
                    category = xref.now_application_document_sub_type_code

            doc_xref = NOWApplicationReferralPackageDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                document_manager_guid=mine_doc.document_manager_guid,
                document_name=mine_doc.document_name,
                version_number=version_number,
                category=category)
            package.documents.append(doc_xref)

        if add_to_session:
            package.save(commit=True)

        return package
