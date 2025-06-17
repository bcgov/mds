from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class AmsFinalApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'ams_final_application_document_type'

    ams_final_application_document_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'{self.__class__.__name__} {self.ams_final_application_document_type_code}'
    
    @staticmethod
    def get_by_document_code(document_code):
        return AmsFinalApplicationDocumentType.query.filter_by(ams_final_application_document_type_code=document_code).first()
    
    @staticmethod
    def get_all():
        return AmsFinalApplicationDocumentType.query.order_by(AmsFinalApplicationDocumentType.description).all()
