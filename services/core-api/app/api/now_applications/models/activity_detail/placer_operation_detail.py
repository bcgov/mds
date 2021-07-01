from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class PlacerOperationDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'placer_operation'}

    def __repr__(self):
        return '<PlacerOperationDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.length_unit_type_code = 'MTR'
        self.width_unit_type_code = 'MTR'
        super(PlacerOperationDetail, self).__init__(**kwargs)
