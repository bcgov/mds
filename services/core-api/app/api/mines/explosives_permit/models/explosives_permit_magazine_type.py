from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class ExplosivesPermitMagazineType(AuditMixin, Base):
    __tablename__ = 'explosives_permit_magazine_type'

    explosives_permit_magazine_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.explosives_permit_magazine_type_code}'

    @classmethod
    def get_all(cls):
        return cls.query.all()
