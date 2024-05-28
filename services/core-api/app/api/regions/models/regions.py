from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class Regions(AuditMixin, Base):
    __tablename__ = "regions"

    regional_district_id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String, nullable=False)

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_id(cls, regional_district_id):
        return cls.query.filter_by(regional_district_id=regional_district_id).first()
