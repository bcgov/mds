from app.extensions import db
from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class CampDetail(ActivityDetailBase):
    __tablename__ = 'camp_detail'
    __mapper_args__ = {'polymorphic_identity': 'camp'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    number_people = db.Column(db.Numeric)
    number_structures = db.Column(db.Numeric)
    description_of_structures = db.Column(db.String)
    waste_disposal = db.Column(db.String)
    sanitary_facilities = db.Column(db.String)
    water_supply = db.Column(db.String)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.activity_detail_id}>'
