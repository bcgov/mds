from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class MinistryContactType(AuditMixin, Base):
    __tablename__ = 'emli_contact_type'
    emli_contact_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MinistryContactType %r>' % self.emli_contact_type_code

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).all()

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()

    @classmethod
    def find_contact_type(cls, emli_contact_type_code):
        return cls.query.filter_by(emli_contact_type_code=emli_contact_type_code).filter_by(
            active_ind=True).all()
