from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class VarianceDocumentCategoryCode(AuditMixin, Base):
    __tablename__ = "variance_document_category_code"
    variance_document_category_code = db.Column(db.String, primary_key=True, nullable=False)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<VarianceDocumentCategoryCode %r>' % self.variance_document_category_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
