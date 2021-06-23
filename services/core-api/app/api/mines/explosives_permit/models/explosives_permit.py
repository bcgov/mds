from datetime import datetime
from pytz import timezone

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from sqlalchemy import and_

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

# NOTE: MMS is also a valid originating system, but not via our API.
ORIGINATING_SYSTEMS = ['Core', 'MineSpace']


class ExplosivesPermit(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'explosives_permit'

    explosives_permit_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    explosives_permit_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue(), nullable=False, unique=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'), nullable=False)
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
    issuing_inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    application_status = db.Column(
        db.String, db.ForeignKey('explosives_permit_status.explosives_permit_status_code'))

    permit_number = db.Column(db.String, unique=True)
    issue_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)

    application_number = db.Column(db.String, nullable=False, unique=True)
    application_date = db.Column(db.Date, nullable=False)
    originating_system = db.Column(db.String, nullable=False)
    received_timestamp = db.Column(db.DateTime, server_default=FetchedValue(), nullable=False)
    decision_timestamp = db.Column(db.DateTime)
    decision_reason = db.Column(db.String)

    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)

    magazines = db.relationship('ExplosivesPermitMagazine', lazy='joined')
    documents = db.relationship('ExplosivesPermitDocumentXref', lazy='joined')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='joined',
        secondary='explosives_permit_document_xref',
        secondaryjoin=
        'and_(foreign(ExplosivesPermitDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    def __init__(self, **kwargs):
        self.application_number = ExplosivesPermit.get_next_application_number()
        super(ExplosivesPermit, self).__init__(**kwargs)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.explosives_permit_id}>'

    def save(self):
        super(ExplosivesPermit, self).save()

    @validates('originating_system')
    def validate_originating_system(self, key, val):
        if val not in ORIGINATING_SYSTEMS:
            raise AssertionError(
                f'Originating system must be one of: {"".join(ORIGINATING_SYSTEMS, ", ")}')
        return val

    @classmethod
    def get_next_application_number(cls):
        now = datetime.now(timezone('US/Pacific'))
        month = now.strftime('%m')
        year = now.strftime('%Y')
        base = 10000
        total = cls.query.count()
        return f'{base + total}-{year}-{month}'

    @classmethod
    def get_next_permit_number(cls):
        prefix = 'BC-'
        base = 10000
        total = cls.query.filter(
            and_(cls.originating_system.in_(ORIGINATING_SYSTEMS)),
            cls.application_status == 'APP').count()
        return f'{prefix}{base + total}'

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def find_by_explosives_permit_guid(cls, explosives_permit_guid):
        return cls.query.filter_by(
            explosives_permit_guid=explosives_permit_guid, deleted_ind=False).one_or_none()
