import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_submissions.models.application import Application
from app.api.mms_now_submissions.models.application import MMSApplication


class NOWApplicationIdentity(Base, AuditMixin):
    __tablename__ = "now_application_identity"

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    messageid = db.Column(db.Integer)
    mms_cid = db.Column(db.Integer)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')

    now_application = db.relationship('NOWApplication')

    def __repr__(self):
        return '<NOWApplicationIdentity %r>' % self.now_application_guid

    @property
    def now_submission(self):
        return Application.query.find(self.messageid).first()

    @now_submission.setter
    def now_submission(self, now_submission):
        self.messageid = now_submission.messageid

    @hybrid_property
    def mms_now_submission(self):
        return MMSApplication.query.filter_by(mms_cid=self.mms_cid).first()

    @classmethod
    def find_by_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(now_application_guid=_id).first()
        except ValueError:
            return None