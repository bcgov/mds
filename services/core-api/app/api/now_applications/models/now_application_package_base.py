from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.declarative import declared_attr

from app.extensions import db


class PackageDocumentXrefMixin:
    """
    Columns and behaviour shared by the document snapshots of a NoW package (e.g. Referral, Consultation).
    Subclasses declare their own primary key and package foreign key.
    """
    document_manager_guid = db.Column(UUID(as_uuid=True), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    version_number = db.Column(db.Integer, nullable=False, default=1)
    category = db.Column(db.String(100), nullable=True)
    # When the file captured by this snapshot was uploaded. MineDocumentVersion copies this value
    # when the file is replaced, so it identifies the archived version without relying on list order.
    file_create_timestamp = db.Column(db.DateTime(timezone=True), nullable=True)

    @declared_attr
    def mine_document_guid(cls):
        return db.Column(
            UUID(as_uuid=True),
            db.ForeignKey('mine_document.mine_document_guid'),
            nullable=False)

    @declared_attr
    def mine_document(cls):
        return db.relationship('MineDocument', lazy='joined')

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


class PackageMixin:
    """
    Columns and behaviour shared by the NoW packages (e.g. Referral, Consultation). Subclasses declare their own
    primary key, guid and `documents` relationship, and set `package_label` (e.g. 'Referral').
    """
    package_label = None

    package_order = db.Column(db.Integer, nullable=False)
    package_name = db.Column(db.String(100), nullable=False)

    @declared_attr
    def now_application_id(cls):
        return db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'), nullable=False)

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
            package_name=f'{cls.package_label} Package #{package_order}')

        xref_class = cls.documents.property.mapper.class_
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
                xref_class(
                    mine_document_guid=mine_doc.mine_document_guid,
                    document_manager_guid=mine_doc.document_manager_guid,
                    document_name=mine_doc.document_name,
                    version_number=len(mine_doc.versions) + 1,
                    file_create_timestamp=mine_doc.create_timestamp,
                    category=category))

        return package
