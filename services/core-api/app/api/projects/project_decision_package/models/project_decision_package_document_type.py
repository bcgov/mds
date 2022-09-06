from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ProjectDecisionPackageDocumentType(AuditMixin, Base):
    __tablename__ = 'project_decision_package_document_type'

    project_decision_package_document_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_decision_package_document_type_code}'

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()
