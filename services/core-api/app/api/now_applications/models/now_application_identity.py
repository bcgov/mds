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
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.constants import *


class NOWApplicationIdentity(Base, AuditMixin):
    __tablename__ = 'now_application_identity'

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_number = db.Column(db.String)
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    messageid = db.Column(db.Integer)
    mms_cid = db.Column(db.Integer)
    source_permit_amendment_id = db.Column(db.Integer,
                                           db.ForeignKey('permit_amendment.permit_amendment_id'))
    application_type_code = db.Column(
        db.String,
        db.ForeignKey('application_type_code.application_type_code'),
        nullable=False,
        server_default=FetchedValue())

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')

    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    permit = db.relationship('Permit', lazy='select')
    application_delays = db.relationship('NOWApplicationDelay')
    is_document_import_requested = db.Column(db.Boolean, server_default=FetchedValue())

    now_application = db.relationship('NOWApplication')
    application_delays = db.relationship(
        'NOWApplicationDelay',
        lazy='selectin',
        uselist=True,
        order_by='desc(NOWApplicationDelay.start_date)')

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
        return MMSApplication.query.filter_by(mms_cid=self.mms_cid).one_or_none()

    @classmethod
    def find_by_guid(cls, now_application_guid):
        return cls.query.filter_by(now_application_guid=now_application_guid).one_or_none()

    @classmethod
    def find_by_messageid(cls, messageid):
        return cls.query.filter_by(messageid=messageid).one_or_none()

    @classmethod
    def find_by_now_number(cls, now_number):
        return cls.query.filter_by(now_number=now_number).one_or_none()

    @classmethod
    def submission_count_ytd(cls, _mine_guid, _sub_year):
        return cls.query.filter_by(mine_guid=_mine_guid).filter(
            cls.now_number.ilike(f'%-{_sub_year}-%')).count()

    @classmethod
    def create_now_number(cls, mine):
        current_year = datetime.now().strftime("%Y")
        number_of_now = cls.submission_count_ytd(mine.mine_guid, current_year)
        return f'{mine.mine_no}-{current_year}-{str(number_of_now + 1).zfill(2)}'