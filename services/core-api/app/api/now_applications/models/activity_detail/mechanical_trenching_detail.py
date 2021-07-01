from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class MechanicalTrenchingDetail(ActivityDetailBase):
    __mapper_args__ = {'polymorphic_identity': 'mechanical_trenching'}

    def __repr__(self):
        return '<MechanicalTrenchingDetail %r>' % self.activity_detail_id
