from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class ExplorationAccessDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'exploration_access'}

    def __repr__(self):
        return '<ExplorationAccessDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.length_unit_type_code = 'KMT'
        super(ExplorationAccessDetail, self).__init__(**kwargs)
