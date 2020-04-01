from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class ActivityType(Base, AuditMixin):
    __tablename__ = "activity_type"

    activity_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ActivityType %r>' % self.activity_type_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()