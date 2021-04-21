from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class ApplicationStartStop(Base, AuditMixin):
    __tablename__ = "application_start_stop_json"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, primary_key=True)
    messagebody = db.Column(db.String)

    def __repr__(self):
        return '<ApplicationStartStop %r>' % self.messageid

    @classmethod
    def create(
            cls,
            messagebody):
        application_start_stop = cls(
            messagebody=messagebody)
        return application_start_stop