from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MajorMineApplicationDocumentSubtype(AuditMixin, Base):
    __tablename__ = 'major_mine_application_document_subtype'

    major_mine_application_document_subtype_code = db.Column(
        db.String(3), primary_key=True)
    major_mine_application_document_type_code = db.Column(
        db.String(3), 
        db.ForeignKey('major_mine_application_document_type.major_mine_application_document_type_code'),
        nullable=False)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.SmallInteger, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.major_mine_application_document_subtype_code}'

    @classmethod
    def get_all(cls):
        return cls.query.order_by(
            cls.major_mine_application_document_type_code, 
            cls.display_order).all()

    @classmethod
    def find_by_subtype_code(cls, subtype_code):
        return cls.query.filter_by(
            major_mine_application_document_subtype_code=subtype_code).first()

    @classmethod
    def find_active_by_type_code(cls, type_code):
        return cls.query.filter_by(
            major_mine_application_document_type_code=type_code,
            active_ind=True).order_by(cls.display_order).all()

    @classmethod
    def find_all_active(cls):
        return cls.query.filter_by(active_ind=True).order_by(
            cls.major_mine_application_document_type_code, 
            cls.display_order).all()