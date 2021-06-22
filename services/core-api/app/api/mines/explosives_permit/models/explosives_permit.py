from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

ORIGINATING_SYSTEM_OPTIONS = ["Core", "MineSpace"]


class ExplosivesPermit(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'explosives_permit'

    explosives_permit_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    explosives_permit_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue(), nullable=False, unique=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'), nullable=False)
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
    issuing_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)

    explosives_permit_number = db.Column(db.String, nullable=False, unique=True)
    originating_system = db.Column(db.String, nullable=False)

    application_date = db.Column(db.Date, nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)

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
        self.explosives_permit_number = ExplosivesPermit.get_next_explosives_permit_number()
        super(ExplosivesPermit, self).__init__(**kwargs)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.explosives_permit_id}>'

    def save(self):
        super(ExplosivesPermit, self).save()

    @validates('originating_system')
    def validate_originating_system(self, key, val):
        if val not in ORIGINATING_SYSTEM_OPTIONS:
            raise AssertionError(
                f'Originating system must be one of: {"".join(ORIGINATING_SYSTEM_OPTIONS, ", ")}')
        return val

    # TODO: Validation for application_date, issue_date, expiry_date.
    # @validates('application_date')
    # def validate_application_date(self, key,val):
    #     return val

    @classmethod
    def get_next_explosives_permit_number(cls):
        prefix = 'BC-'
        base = 10000
        total = cls.query.count()
        return f'{prefix}{base + total}'

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def find_by_explosives_permit_guid(cls, explosives_permit_guid):
        return cls.query.filter_by(
            explosives_permit_guid=explosives_permit_guid, deleted_ind=False).one_or_none()
