from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


class ExplosivesPermitMagazine(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'explosives_permit_magazine'

    explosives_permit_magazine_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    explosives_permit_id = db.Column(
        db.Integer, db.ForeignKey('explosives_permit.explosives_permit_id'), nullable=False)
    explosives_permit_magazine_type_code = db.Column(
        db.String,
        db.ForeignKey('explosives_permit_magazine_type.explosives_permit_magazine_type_code'),
        nullable=False)

    type_no = db.Column(db.String, nullable=False)
    tag_no = db.Column(db.String, nullable=False)
    construction = db.Column(db.String)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    length = db.Column(db.Numeric)
    width = db.Column(db.Numeric)
    height = db.Column(db.Numeric)
    quantity = db.Column(db.Integer)
    distance_road = db.Column(db.Numeric)
    distance_dwelling = db.Column(db.Numeric)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.explosives_permit_magazine_id}>'
