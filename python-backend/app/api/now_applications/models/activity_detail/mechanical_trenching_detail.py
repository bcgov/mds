from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class MechanicalTrenchingDetail(ActivityDetailBase):
    ## NO TABLE FOR THIS TYPE

    def __repr__(self):
        return '<MechanicalTrenchingDetail %r>' % self.activity_detail_id
