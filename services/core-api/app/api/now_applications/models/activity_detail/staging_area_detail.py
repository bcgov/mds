from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class StagingAreaDetail(ActivityDetailBase):
  __tablename__ = 'staging_area_detail'
  __mapper_args__ = {
      'polymorphic_identity': 'camp',          ## type code
  }

  activity_detail_id = db.Column(
    db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

  purpose = db.Column(db.String)
    ## NO TABLE FOR THIS TYPE
  def __repr__(self):
    return '<StagingArea %r>' % self.activity_detail_id