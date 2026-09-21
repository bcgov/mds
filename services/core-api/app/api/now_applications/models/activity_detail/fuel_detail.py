from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase
from app.extensions import db


class FuelDetail(ActivityDetailBase):
    __tablename__ = 'fuel_detail'
    __mapper_args__ = {'polymorphic_identity': 'fuel'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    fuel_type = db.Column(db.String)
    fuel_related_activity = db.Column(db.String)
    estimated_fuel_volume = db.Column(db.Numeric(14, 2))
    description_of_fuel_related_activity = db.Column(db.String)
    description_of_precautionary_measures = db.Column(db.String)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.activity_detail_id}>'
