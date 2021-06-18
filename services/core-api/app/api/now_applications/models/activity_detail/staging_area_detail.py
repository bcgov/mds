from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class StagingAreaDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'camp'}

    ## NO TABLE FOR THIS TYPE
    def __repr__(self):
        return f'<{self.__class__.__name__} {self.activity_detail_id}>'
