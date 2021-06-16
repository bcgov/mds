from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class CampDetail(ActivityDetailBase):
    __tablename__ = 'camp_detail'
    __mapper_args__ = {
        'polymorphic_identity': 'camp',          ## type code
    }

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    number_people = db.Column(db.Numeric)
    number_structures = db.Column(db.Numeric)
    description_of_structures = db.Column(db.String)
    waste_disposal = db.Column(db.String)
    sanitary_facilities = db.Column(db.String)
    water_supply = db.Column(db.String)

    def __repr__(self):
        return '<CampDetail %r>' % self.activity_detail_id
