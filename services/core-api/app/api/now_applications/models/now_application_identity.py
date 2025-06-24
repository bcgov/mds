import sqlalchemy

from datetime import datetime
from sqlalchemy import func, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import and_, cast
from werkzeug.exceptions import BadRequest
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
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

    now_application = db.relationship('NOWApplication', overlaps='now_application_identity')
    application_delays = db.relationship(
        'NOWApplicationDelay',
        lazy='selectin',
        uselist=True,
        order_by='desc(NOWApplicationDelay.start_date)',
        overlaps='now_application'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.now_application_guid}'

    def transfer(self, mine):

        if self.now_application.now_application_status_code in ['AIA','REJ', 'WDN', 'NPR']:
            raise BadRequest(f'Unable to transfer NOW application with status {self.now_application.now_application_status_code}')
        
        self.now_number = NOWApplicationIdentity.create_now_number(mine, self.now_number_year)
        self.mine = mine

        if self.now_application.documents:
            for document in self.now_application.documents:
                document.mine_document.mine_guid = mine.mine_guid
                document.mine_document.save()

        if self.now_application.draft_permit:

            existing_xref = MinePermitXref.query.filter_by(
                permit_id=self.now_application.draft_permit.permit_id,
                mine_guid=mine.mine_guid
            ).one_or_none()
            if existing_xref:
                existing_xref.is_deleted = False
                existing_xref.start_date = datetime.now()
                existing_xref.save()
            
            else:
                MinePermitXref.create(
                    permit_id = self.now_application.draft_permit.permit_id,
                    mine_guid=mine.mine_guid,
                    start_date=datetime.now()
                )
                self.now_application.draft_permit.mine_permit_xref.delete()

            self.now_application.draft_permit.mine_guid = mine.mine_guid
            self.now_application.draft_permit.save()

            if self.now_application.site_property:
                self.now_application.site_property.mine_guid = mine.mine_guid
                self.now_application.site_property.save()
            

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
    def find_by_now_application_id(cls, now_application_id):
        return cls.query.filter_by(now_application_id=now_application_id).one_or_none()

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
