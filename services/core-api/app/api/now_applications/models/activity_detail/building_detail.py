from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class BuildingDetail(ActivityDetailBase):
    __tablename__ = 'building_detail'
    __mapper_args__ = {'polymorphic_identity': 'building'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    purpose = db.Column(db.String)
    structure = db.Column(db.String)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.activity_detail_id}>'
