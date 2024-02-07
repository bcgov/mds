from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class StagingAreaDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'staging_area'}
    def __repr__(self):
        return f'<{self.__class__.__name__} {self.activity_detail_id}>'
