from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class SurfaceBulkSampleDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'surface_bulk_sample'}

    def __repr__(self):
        return '<SurfaceBulkSampleDetail %r>' % self.activity_detail_id
