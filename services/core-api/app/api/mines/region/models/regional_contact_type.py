from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class RegionalContactType(AuditMixin, Base):
    __tablename__ = 'regional_contact_type'
    regional_contact_type_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<RegionalContactType %r>' % self.regional_contact_type_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()
