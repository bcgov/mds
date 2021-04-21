from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class PlacerOperationDetail(ActivityDetailBase):
    __mapper_args__ = {
        'polymorphic_identity': 'placer_operation', ## type code
    }

    ## NO TABLE FOR THIS TYPE

    def __repr__(self):
        return '<PlacerOperationDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.length_unit_type_code = 'MTR'
        self.width_unit_type_code = 'MTR'
        super(PlacerOperationDetail, self).__init__(**kwargs)
