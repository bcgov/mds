from flask import current_app
from datetime import datetime
from pytz import timezone

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue, Sequence
from sqlalchemy.orm import validates
from sqlalchemy import and_, func
from sqlalchemy.sql.functions import next_value

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.mines.explosives_permit.models.explosives_permit_magazine import ExplosivesPermitMagazine
from app.api.mines.explosives_permit.models.explosives_permit_document_xref import ExplosivesPermitDocumentXref
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.parties.party.models.party import Party

ORIGINATING_SYSTEMS = ['Core', 'MineSpace', 'MMS']


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
    mine_manager_mine_party_appt_id = db.Column(db.Integer,
                                                db.ForeignKey('mine_party_appt.mine_party_appt_id'))
    permittee_mine_party_appt_id = db.Column(db.Integer,
                                             db.ForeignKey('mine_party_appt.mine_party_appt_id'))
    application_status = db.Column(
        db.String, db.ForeignKey('explosives_permit_status.explosives_permit_status_code'))

    permit_number = db.Column(db.String, unique=True)
    issue_date = db.Column(db.Date)
    expiry_date = db.Column(db.Date)

    application_number = db.Column(db.String)
    application_date = db.Column(db.Date, nullable=False)
    originating_system = db.Column(db.String, nullable=False)
    received_timestamp = db.Column(db.DateTime)
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
        'and_(ExplosivesPermitMagazine.explosives_permit_id == ExplosivesPermit.explosives_permit_id, ExplosivesPermitMagazine.explosives_permit_magazine_type_code == "EXP", ExplosivesPermitMagazine.deleted_ind == False)'
    )
    detonator_magazines = db.relationship(
        'ExplosivesPermitMagazine',
        lazy='select',
        primaryjoin=
        'and_(ExplosivesPermitMagazine.explosives_permit_id == ExplosivesPermit.explosives_permit_id, ExplosivesPermitMagazine.explosives_permit_magazine_type_code == "DET", ExplosivesPermitMagazine.deleted_ind == False)'
    )

    documents = db.relationship('ExplosivesPermitDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='explosives_permit_document_xref',
        secondaryjoin=
        'and_(foreign(ExplosivesPermitDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    mines_act_permit = db.relationship('Permit', lazy='select')
    now_application_identity = db.relationship('NOWApplicationIdentity', lazy='select')
    issuing_inspector = db.relationship(
        'Party',
        lazy='select',
        primaryjoin='Party.party_guid == ExplosivesPermit.issuing_inspector_party_guid')
    mine_manager = db.relationship(
        'MinePartyAppointment',
        lazy='select',
        primaryjoin=
        'MinePartyAppointment.mine_party_appt_id == ExplosivesPermit.mine_manager_mine_party_appt_id'
    )
    permittee = db.relationship(
        'MinePartyAppointment',
        lazy='select',
        primaryjoin=
        'MinePartyAppointment.mine_party_appt_id == ExplosivesPermit.permittee_mine_party_appt_id')

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

    @hybrid_property
    def mine_manager_name(self):
        if self.mine_manager:
            return self.mine_manager.party.name
        return None

    @hybrid_property
    def permittee_name(self):
        if self.permittee:
            return self.permittee.party.name
        return None

    @hybrid_property
    def issuing_inspector_name(self):
        if self.issuing_inspector_party_guid:
            party = Party.find_by_party_guid(self.issuing_inspector_party_guid)
            return party.name
        return None

    @validates('originating_system')
    def validate_originating_system(self, key, val):
        if val not in ORIGINATING_SYSTEMS:
            raise AssertionError(
                f'Originating system must be one of: {"".join(ORIGINATING_SYSTEMS, ", ")}')
        return val

    def update(self,
               permit_guid,
               now_application_guid,
               issuing_inspector_party_guid,
               mine_manager_mine_party_appt_id,
               permittee_mine_party_appt_id,
               application_status,
               issue_date,
               expiry_date,
               decision_reason,
               is_closed,
               closed_reason,
               closed_timestamp,
               latitude,
               longitude,
               application_date,
               description,
               explosive_magazines=[],
               detonator_magazines=[],
               documents=[],
               letter_date=None,
               letter_body=None,
               add_to_session=True):

        # Update simple properties.
        self.permit_guid = permit_guid
        self.now_application_guid = now_application_guid
        self.issuing_inspector_party_guid = issuing_inspector_party_guid
        self.mine_manager_mine_party_appt_id = mine_manager_mine_party_appt_id
        self.permittee_mine_party_appt_id = permittee_mine_party_appt_id
        self.application_date = application_date
        self.description = description
        self.issue_date = issue_date
        self.expiry_date = expiry_date
        self.latitude = latitude
        self.longitude = longitude

        # Check for permit closed changes.
        self.is_closed = is_closed
        if is_closed:
            self.closed_reason = closed_reason
            self.closed_timestamp = closed_timestamp if closed_timestamp else datetime.utcnow()
            self.application_status = 'REJ'
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

            # Create or update existing magazines.
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
            if str(doc.mine_document_guid) not in updated_document_guids:
                self.mine_documents.remove(doc.mine_document)
                doc.mine_document.delete(commit=False)

        # Create or update existing documents.
        for doc in documents:
            explosives_permit_document_type_code = doc.get('explosives_permit_document_type_code')
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                explosives_permit_doc = ExplosivesPermitDocumentXref.find_by_mine_document_guid(
                    mine_document_guid)
                explosives_permit_doc.explosives_permit_document_type_code = explosives_permit_document_type_code
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                explosives_permit_doc = ExplosivesPermitDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    explosives_permit_id=self.explosives_permit_id,
                    explosives_permit_document_type_code=explosives_permit_document_type_code)
                explosives_permit_doc.mine_document = mine_doc
                self.documents.append(explosives_permit_doc)

        # Check for application status changes or application is Approved to regenerate permit and letter.
        if application_status:
            if application_status != 'REC' and application_status != 'APP':
                self.decision_timestamp = datetime.utcnow()
                self.decision_reason = decision_reason

            if (self.application_status == 'REC'
                    or self.application_status == 'APP') and application_status == 'APP':
                from app.api.document_generation.resources.explosives_permit_document_resource import ExplosivesPermitDocumentResource
                from app.api.mines.explosives_permit.resources.explosives_permit_document_type import ExplosivesPermitDocumentGenerateResource

                def create_permit_enclosed_letter():
                    mine = self.mine
                    # TODO: Implement a method in the document type to automatically get all read-only context values.
                    template_data = {
                        'letter_date': letter_date,
                        'letter_body': letter_body,
                        'rc_office_email': mine.region.regional_contact_office.email,
                        'rc_office_phone_number': mine.region.regional_contact_office.phone_number,
                        'rc_office_fax_number': mine.region.regional_contact_office.fax_number,
                        'rc_office_mailing_address_line_1':
                        mine.region.regional_contact_office.mailing_address_line_1,
                        'rc_office_mailing_address_line_2':
                        mine.region.regional_contact_office.mailing_address_line_2,
                        'is_draft': False
                    }
                    explosives_permit_document_type = ExplosivesPermitDocumentType.get_with_context(
                        'LET', self.explosives_permit_guid)
                    template_data = explosives_permit_document_type.transform_template_data(
                        template_data, self)
                    token = ExplosivesPermitDocumentGenerateResource.get_explosives_document_generate_token(
                        explosives_permit_document_type.explosives_permit_document_type_code,
                        self.explosives_permit_guid, template_data)
                    # TODO: Remove Logs for generate document
                    current_app.logger.debug(
                        f'explosives_permit_document_type: {explosives_permit_document_type}, token (create_permit_enclosed_letter): {token}'
                    )
                    return ExplosivesPermitDocumentResource.generate_explosives_permit_document(
                        token, True, False, False)

                def create_issued_permit():
                    template_data = {'is_draft': False}
                    explosives_permit_document_type = ExplosivesPermitDocumentType.get_with_context(
                        'PER', self.explosives_permit_guid)
                    template_data = explosives_permit_document_type.transform_template_data(
                        template_data, self)
                    token = ExplosivesPermitDocumentGenerateResource.get_explosives_document_generate_token(
                        explosives_permit_document_type.explosives_permit_document_type_code,
                        self.explosives_permit_guid, template_data)
                    # TODO: Remove Logs for generate document
                    current_app.logger.debug(
                        f'explosives_permit_document_type: {explosives_permit_document_type}, token (create_issued_permit): {token}'
                    )
                    return ExplosivesPermitDocumentResource.generate_explosives_permit_document(
                        token, True, False, False)
                if self.application_status == 'REC' and application_status == 'APP':
                    self.permit_number = ExplosivesPermit.get_next_permit_number()
                create_permit_enclosed_letter()
                create_issued_permit()

            self.application_status = application_status

        if add_to_session:
            self.save(commit=False)
        return self

    def delete(self, commit=True):
        for magazine in self.explosive_magazines:
            magazine.delete(False)
        for magazine in self.detonator_magazines:
            magazine.delete(False)
        for doc in self.documents:
            self.mine_documents.remove(doc.mine_document)
            doc.mine_document.delete(False)
        super(ExplosivesPermit, self).delete(commit)

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
        sequence = Sequence('explosives_permit_number_sequence')
        next_value = sequence.next_value()
        return func.concat(prefix, next_value)

    @classmethod
    def create(cls,
               mine,
               permit_guid,
               application_date,
               originating_system,
               latitude,
               longitude,
               description,
               issue_date,
               expiry_date,
               permit_number,
               issuing_inspector_party_guid,
               mine_manager_mine_party_appt_id,
               permittee_mine_party_appt_id,
               is_closed,
               closed_reason,
               closed_timestamp,
               explosive_magazines=[],
               detonator_magazines=[],
               documents=[],
               now_application_guid=None,
               add_to_session=True):

        application_number = None
        received_timestamp = None
        if originating_system == 'MMS':
            application_status = 'APP'
        else:
            application_status = 'REC'
            application_number = ExplosivesPermit.get_next_application_number()
            received_timestamp = datetime.utcnow()
            is_closed = False
            permit_number = None
            issue_date = None
            expiry_date = None

        if is_closed:
            if closed_timestamp is None:
                closed_timestamp = datetime.utcnow()
        else:
            closed_reason = None
            closed_timestamp = None

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
            issue_date=issue_date,
            expiry_date=expiry_date,
            permit_number=permit_number,
            issuing_inspector_party_guid=issuing_inspector_party_guid,
            mine_manager_mine_party_appt_id=mine_manager_mine_party_appt_id,
            permittee_mine_party_appt_id=permittee_mine_party_appt_id,
            is_closed=is_closed,
            closed_reason=closed_reason,
            closed_timestamp=closed_timestamp,
            now_application_guid=now_application_guid)

        mine.explosives_permits.append(explosives_permit)

        for magazine_data in explosive_magazines:
            magazine = ExplosivesPermitMagazine.create_from_data('EXP', magazine_data)
            explosives_permit.explosive_magazines.append(magazine)

        for magazine_data in detonator_magazines:
            magazine = ExplosivesPermitMagazine.create_from_data('DET', magazine_data)
            explosives_permit.detonator_magazines.append(magazine)

        for doc in documents:
            explosives_permit_document_type_code = doc.get('explosives_permit_document_type_code')
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            explosives_permit_doc = ExplosivesPermitDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                explosives_permit_id=explosives_permit.explosives_permit_id,
                explosives_permit_document_type_code=explosives_permit_document_type_code)
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
