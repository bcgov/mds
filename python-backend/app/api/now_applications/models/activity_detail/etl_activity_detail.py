import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ETLActivityDetail(Base):
    __tablename__ = 'etl_activity_detail'
    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)
    placeractivityid = db.Column(db.Integer)
    settlingpondid = db.Column(db.Integer)

    activity_detail = db.relationship('ActivityDetailBase', uselist=False, load_on_pending=True)
