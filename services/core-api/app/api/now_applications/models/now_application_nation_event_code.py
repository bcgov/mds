from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base

class NOWApplicationNationEventCode(AuditMixin, Base):
    __tablename__ = 'now_application_nation_event_code'

    now_application_nation_event_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<NOWApplicationNationEventCode %r>' % self.now_application_nation_event_code

    @classmethod
    def find_by_now_application_nation_event_code(cls, code):
        return cls.query.filter_by(now_application_nation_event_code=code).first()

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()
