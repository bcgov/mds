import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class SettlingPondDetail(ActivityDetailBase):
    __tablename__ = 'settling_pond_detail'
    __mapper_args__ = {
        'polymorphic_identity': 'settling_pond',  ## type code
    }

    activity_detail_id = db.Column(db.Integer,
                                   db.ForeignKey('activity_detail.activity_detail_id'),
                                   primary_key=True)

    water_source_description = db.Column(db.String)
    construction_plan = db.Column(db.String)

    def __repr__(self):
        return '<SettlingPondDetail %r>' % self.activity_detail_id
