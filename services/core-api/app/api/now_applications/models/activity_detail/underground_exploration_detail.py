from app.extensions import db
from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class UndergroundExplorationDetail(ActivityDetailBase):
    __tablename__ = 'underground_exploration_detail'
    __mapper_args__ = {'polymorphic_identity': 'underground_exploration'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    underground_exploration_type_code = db.Column(
        db.String, db.ForeignKey('underground_exploration_type.underground_exploration_type_code'))

    def __repr__(self):
        return '<UndergroundExplorationDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.length_unit_type_code = 'MTR'
        self.height_unit_type_code = 'MTR'
        self.width_unit_type_code = 'MTR'
        super(UndergroundExplorationDetail, self).__init__(**kwargs)
