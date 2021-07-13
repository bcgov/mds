from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class SandGravelQuarryOperationDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'sand_gravel_quarry_operation'}

    def __repr__(self):
        return '<SandGravelQuarryOperationDetail %r>' % self.activity_detail_id
