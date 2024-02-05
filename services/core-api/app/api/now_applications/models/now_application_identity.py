import sqlalchemy

from datetime import datetime
from sqlalchemy import func, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import and_, cast

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.now_submissions.models.application import Application
from app.api.mms_now_submissions.models.application import MMSApplication
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

    now_application = db.relationship('NOWApplication', back_populates='now_application_identity')
    application_delays = db.relationship(
        'NOWApplicationDelay',
        lazy='selectin',
        uselist=True,
        order_by='desc(NOWApplicationDelay.start_date)',
        back_populates='now_application'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.now_application_guid}'

    def transfer(self, mine):
        self.now_number = NOWApplicationIdentity.create_now_number(mine, self.now_number_year)
        self.mine = mine

    @hybrid_property
    def now_number_year(self):
        if self.now_number:
            return self.now_number.split('-')[1]

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
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).first()

    @classmethod
    def get_max_now_number_suffix(cls, mine_guid, year):
        suffix = cls.query.with_entities(
            func.max(cast(func.split_part(cls.now_number, '-', 3), sqlalchemy.Integer))).filter(
                and_(cls.mine_guid == mine_guid, cls.now_number.ilike(f'%-{year}-%'))).scalar()
        if suffix is None:
            suffix = 0
        return suffix

    @classmethod
    def create_now_number(cls, mine, year=None):
        if year == None:
            year = datetime.now().strftime('%Y')
        suffix = cls.get_max_now_number_suffix(mine.mine_guid, year)
        return f'{mine.mine_no}-{year}-{str(suffix + 1).zfill(2)}'
