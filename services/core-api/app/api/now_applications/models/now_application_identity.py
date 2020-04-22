import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_submissions.models.application import Application
from app.api.mms_now_submissions.models.application import MMSApplication
from app.api.constants import *


class NOWApplicationIdentity(Base, AuditMixin):
    __tablename__ = "now_application_identity"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_number = db.Column(db.String)
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    messageid = db.Column(db.Integer)
    mms_cid = db.Column(db.Integer)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')

    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    permit = db.relationship('Permit', lazy='select')

    now_application = db.relationship('NOWApplication')

    def __repr__(self):
        return '<NOWApplicationIdentity %r>' % self.now_application_guid

    @property
    def now_submission(self):
        return Application.query.get(self.messageid)

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

    @classmethod
    def find_by_messageid(cls, messageid):
        return cls.query.filter_by(messageid=messageid).first()

    @classmethod
    def find_by_now_number(cls, now_number):
        return cls.query.filter_by(now_number=now_number).first()

    @classmethod
    def submission_count_ytd(cls, _mine_guid, _sub_year):
        try:
            return cls.query.filter_by(mine_guid=_mine_guid).filter(
                cls.now_number.ilike(f'%-{_sub_year}-%')).count()
        except ValueError:
            return None

    @classmethod
    def create_now_number(cls, mine):
        current_year = datetime.now().strftime("%Y")
        number_of_now = cls.submission_count_ytd(mine.mine_guid, current_year)
        return f'{mine.mine_no}-{current_year}-{str(number_of_now + 1).zfill(2)}'