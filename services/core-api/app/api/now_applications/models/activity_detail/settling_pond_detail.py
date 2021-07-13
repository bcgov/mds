from app.extensions import db
from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase


class SettlingPondDetail(ActivityDetailBase):
    __tablename__ = 'settling_pond_detail'
    __mapper_args__ = {'polymorphic_identity': 'settling_pond'}

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)

    water_source_description = db.Column(db.String)
    construction_plan = db.Column(db.String)

    def __repr__(self):
        return '<SettlingPondDetail %r>' % self.activity_detail_id

    def __init__(self, **kwargs):
        self.length_unit_type_code = 'MTR'
        self.depth_unit_type_code = 'MTR'
        self.width_unit_type_code = 'MTR'
        super(SettlingPondDetail, self).__init__(**kwargs)
