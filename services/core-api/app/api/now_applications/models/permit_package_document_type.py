from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class PermitPackageDocumentType(AuditMixin, Base):
    __tablename__ = 'permit_package_document_type'

    permit_package_document_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def get_all(cls):
        return cls.query.all()
