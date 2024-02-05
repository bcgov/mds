from app.extensions import db
from app.api.utils.models_mixins import Base


class ETLActivityDetail(Base):
    __tablename__ = 'etl_activity_detail'

    activity_detail_id = db.Column(
        db.Integer, db.ForeignKey('activity_detail.activity_detail_id'), primary_key=True)
    placeractivityid = db.Column(db.Integer)
    settlingpondid = db.Column(db.Integer)

    activity_detail = db.relationship('ActivityDetailBase', uselist=False, load_on_pending=True, back_populates='_etl_activity_details')
