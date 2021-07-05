from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class ExplorationSurfaceDrillingDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'exploration_surface_drilling'}

    def __repr__(self):
        return '<ExplorationSurfaceDrillingDetail %r>' % self.activity_detail_id
