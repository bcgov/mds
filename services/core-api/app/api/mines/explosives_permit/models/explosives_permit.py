from datetime import datetime
from pytz import timezone

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from sqlalchemy import and_

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db
from app.api.mines.explosives_permit.models.explosives_permit_magazine import ExplosivesPermitMagazine
from app.api.mines.explosives_permit.models.explosives_permit_document_xref import ExplosivesPermitDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument

# NOTE: MMS is also a valid originating system, but not via our API.
ORIGINATING_SYSTEMS = ['Core', 'MineSpace']


class ExplosivesPermit(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'explosives_permit'

    explosives_permit_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    explosives_permit_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'), nullable=False)
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
    issuing_inspector_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
    mine_operator_party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'))
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
    description = db.Column(db.String)

    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)

    is_closed = db.Column(db.Boolean)
    closed_timestamp = db.Column(db.DateTime)
    closed_reason = db.Column(db.String)

    explosive_magazines = db.relationship(
        'ExplosivesPermitMagazine',
        lazy='select',
        primaryjoin=
        "and_(ExplosivesPermitMagazine.explosives_permit_id == ExplosivesPermit.explosives_permit_id, ExplosivesPermitMagazine.explosives_permit_magazine_type_code == 'EXP', ExplosivesPermitMagazine.deleted_ind == False)"
    )
    detonator_magazines = db.relationship(
        'ExplosivesPermitMagazine',
        lazy='select',
        primaryjoin=
        "and_(ExplosivesPermitMagazine.explosives_permit_id == ExplosivesPermit.explosives_permit_id, ExplosivesPermitMagazine.explosives_permit_magazine_type_code == 'DET', ExplosivesPermitMagazine.deleted_ind == False)"
    )

    # mine = db.relationship('Mine', lazy='select')
    documents = db.relationship('ExplosivesPermitDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='joined',
        secondary='explosives_permit_document_xref',
        secondaryjoin=
        'and_(foreign(ExplosivesPermitDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    mines_act_permit = db.relationship('Permit', lazy='select')
    now_application_identity = db.relationship('NOWApplicationIdentity', lazy='select')
    issuing_inspector = db.relationship(
        'Party',
        lazy='select',
        primaryjoin="Party.party_guid == ExplosivesPermit.issuing_inspector_party_guid")

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.explosives_permit_id}>'

    @hybrid_property
    def total_explosive_quantity(self):
        if self.explosive_magazines:
            total = sum(item.quantity if item.quantity else 0 for item in self.explosive_magazines)
            return total if total else 0
        return None

    @hybrid_property
    def total_detonator_quantity(self):
        if self.detonator_magazines:
            total = sum(item.quantity if item.quantity else 0 for item in self.detonator_magazines)
            return total if total else 0
        return None

    # Add validation on application date for not being in the future.

    @validates('originating_system')
    def validate_originating_system(self, key, val):
        if val not in ORIGINATING_SYSTEMS:
            raise AssertionError(
                f'Originating system must be one of: {"".join(ORIGINATING_SYSTEMS, ", ")}')
        return val

    # TODO: Ensure that this method is transactional with its created/updated/deleted relationships.
    def update(self,
               permit_guid,
               now_application_guid,
               issuing_inspector_party_guid,
               mine_operator_party_guid,
               application_status,
               issue_date,
               expiry_date,
               decision_reason,
               is_closed,
               closed_reason,
               latitude,
               longitude,
               application_date,
               description,
               explosive_magazines=[],
               detonator_magazines=[],
               documents=[],
               add_to_session=True):

        # Update simple properties.
        self.permit_guid = permit_guid
        self.now_application_guid = now_application_guid
        self.issuing_inspector_party_guid = issuing_inspector_party_guid
        self.mine_operator_party_guid = mine_operator_party_guid
        self.application_date = application_date
        self.description = description
        self.issue_date = issue_date
        self.expiry_date = expiry_date
        self.latitude = latitude
        self.longitude = longitude

        # Check for application status changes.
        if application_status and application_status != 'REC':
            # TODO: Generate both of the documents here.
            if application_status == 'APP':
                self.permit_number = ExplosivesPermit.get_next_permit_number()
            self.application_status = application_status
            self.decision_timestamp = datetime.utcnow()
            self.decision_reason = decision_reason

        # Check for permit closed changes.
        self.is_closed = is_closed
        if is_closed:
            self.closed_reason = closed_reason
            self.closed_timestamp = datetime.utcnow()
        else:
            self.closed_reason = None
            self.closed_timestamp = None

        def process_magazines(magazines, updated_magazines, type):
            # Get the IDs of the updated magazines.
            updated_magazines_ids = [
                magazine.get('explosives_permit_magazine_id') for magazine in updated_magazines
            ]

            # Delete deleted magazines.
            for magazine in magazines:
                if magazine.explosives_permit_magazine_id not in updated_magazines_ids:
                    magazine.delete(commit=False)

            # Create or update existing explosive magazines.
            for magazine_data in updated_magazines:
                explosives_permit_magazine_id = magazine_data.get('explosives_permit_magazine_id')
                if explosives_permit_magazine_id:
                    magazine = ExplosivesPermitMagazine.find_by_explosives_permit_magazine_id(
                        explosives_permit_magazine_id)
                    magazine.update_from_data(magazine_data)
                else:
                    magazine = ExplosivesPermitMagazine.create_from_data(type, magazine_data)
                    magazines.append(magazine)

        process_magazines(self.explosive_magazines, explosive_magazines, 'EXP')
        process_magazines(self.detonator_magazines, detonator_magazines, 'DET')

        # Get the GUIDs of the updated documents.
        updated_document_guids = [doc.get('mine_document_guid') for doc in documents]

        # Delete deleted documents.
        for doc in self.documents:
            if doc.mine_document_guid not in updated_document_guids:
                doc.mine_document.delete(commit=False)

        # Create or update existing documents.
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                explosives_permit_doc = ExplosivesPermitDocumentXref.find_by_mine_document_guid(
                    mine_document_guid)
                explosives_permit_doc.explosives_permit_document_type_code = doc.get(
                    'explosives_permit_document_type_code')
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                # mine_doc.save(commit=False)
                explosives_permit_doc = ExplosivesPermitDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    explosives_permit_id=self.explosives_permit_id,
                    explosives_permit_document_type_code=doc.get(
                        'explosives_permit_document_type_code'))
                explosives_permit_doc.mine_document = mine_doc
                self.documents.append(explosives_permit_doc)

        if add_to_session:
            self.save(commit=False)
        return self

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

    # TODO: Ensure that this method is transactional with its created relationships.
    @classmethod
    def create(cls,
               mine,
               permit_guid,
               application_date,
               originating_system,
               latitude,
               longitude,
               description,
               explosive_magazines=[],
               detonator_magazines=[],
               documents=[],
               now_application_guid=None,
               add_to_session=True):

        application_status = 'REC'
        application_number = ExplosivesPermit.get_next_application_number()
        received_timestamp = datetime.utcnow()

        explosives_permit = cls(
            permit_guid=permit_guid,
            application_status=application_status,
            application_number=application_number,
            received_timestamp=received_timestamp,
            application_date=application_date,
            originating_system=originating_system,
            latitude=latitude,
            longitude=longitude,
            description=description,
            now_application_guid=now_application_guid)
        mine.explosives_permits.append(explosives_permit)
        explosives_permit.save(commit=False)
        for magazine_data in explosive_magazines:
            magazine = ExplosivesPermitMagazine.create_from_data('EXP', magazine_data)
            explosives_permit.explosive_magazines.append(magazine)

        for magazine_data in detonator_magazines:
            magazine = ExplosivesPermitMagazine.create_from_data('DET', magazine_data)
            explosives_permit.detonator_magazines.append(magazine)

        for doc in documents:
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            # mine_doc.save(commit=False)
            explosives_permit_doc = ExplosivesPermitDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                explosives_permit_id=explosives_permit.explosives_permit_id,
                explosives_permit_document_type_code=doc.get(
                    'explosives_permit_document_type_code'))
            explosives_permit_doc.mine_document = mine_doc
            explosives_permit.documents.append(explosives_permit_doc)

        if add_to_session:
            explosives_permit.save(commit=False)
        return explosives_permit

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid, deleted_ind=False).all()

    @classmethod
    def find_by_explosives_permit_guid(cls, explosives_permit_guid):
        return cls.query.filter_by(
            explosives_permit_guid=explosives_permit_guid, deleted_ind=False).one_or_none()
