from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class ExplosivesPermitStatus(AuditMixin, Base):
    __tablename__ = 'explosives_permit_status'

    explosives_permit_status_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.explosives_permit_document_type_code}'

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()
