from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.now_applications.models.now_application_package_base import PackageMixin, PackageDocumentXrefMixin


class NOWApplicationReferralPackageDocumentXref(PackageDocumentXrefMixin, SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_referral_package_document_xref'

    now_application_referral_package_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_application_referral_package_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application_referral_package.now_application_referral_package_id'),
        nullable=False)

    def __repr__(self):
        return f'<NOWApplicationReferralPackageDocumentXref {self.now_application_referral_package_document_xref_guid}>'


class NOWApplicationReferralPackage(PackageMixin, SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_referral_package'
    package_label = 'Referral'

    now_application_referral_package_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_referral_package_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue())

    documents = db.relationship(
        'NOWApplicationReferralPackageDocumentXref',
        backref='referral_package',
        lazy='joined',
        cascade='all, delete-orphan')

    def __repr__(self):
        return f'<NOWApplicationReferralPackage {self.now_application_referral_package_id}>'
