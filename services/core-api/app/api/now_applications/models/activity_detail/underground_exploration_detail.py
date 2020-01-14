from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class UndergroundExplorationDetail(ActivityDetailBase):
    __tablename__ = 'underground_exploration_detail'
    __mapper_args__ = {
        'polymorphic_identity': 'underground_exploration', ## type code
    }

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    underground_exploration_type_code = db.Column(
        db.String, db.ForeignKey('underground_exploration_type.underground_exploration_type_code'))

    def __repr__(self):
        return '<UndergroundExplorationDetail %r>' % self.activity_detail_id
