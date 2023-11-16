from flask import current_app
from datetime import datetime
from pytz import timezone

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import Sequence
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.parties.party.models.party import Party

from app.api.mines.explosives_permit_amendment.models.explosives_permit_amendment_document_xref import \
    ExplosivesPermitAmendmentDocumentXref
from app.api.mines.explosives_permit_amendment.models.explosives_permit_amendment_magazine import \
    ExplosivesPermitAmendmentMagazine
from app.api.utils.models_mixins import Base, SoftDeleteMixin, AuditMixin, PermitMixin
from sqlalchemy import func, and_
from sqlalchemy.sql import update
from app.api.utils.include.user_info import User

from app.extensions import db


class ExplosivesPermitAmendment(SoftDeleteMixin, AuditMixin, PermitMixin, Base):
    __tablename__ = 'explosives_permit_amendment'

    explosives_permit_amendment_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=db.FetchedValue())
    explosives_permit_amendment_id = db.Column(
        db.Integer, server_default=db.FetchedValue(), nullable=False, unique=True)

    permit_number = db.Column(db.String)

    explosives_permit_id = db.Column(
        db.Integer, db.ForeignKey('explosives_permit.explosives_permit_id'), nullable=False)

    explosives_permit_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('explosives_permit.explosives_permit_guid'), nullable=False)

    explosives_permit = db.relationship(
        'ExplosivesPermit',
        primaryjoin='ExplosivesPermit.explosives_permit_id == ExplosivesPermitAmendment.explosives_permit_id',
        back_populates='explosives_permit_amendments'
    )

    documents = db.relationship('ExplosivesPermitAmendmentDocumentXref', lazy='select')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='explosives_permit_amendment_document_xref',
        secondaryjoin='and_(foreign(ExplosivesPermitAmendmentDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid), MineDocument.deleted_ind == False)'
    )

    mines_act_permit = db.relationship('Permit', lazy='select')
    now_application_identity = db.relationship('NOWApplicationIdentity', lazy='select')

    explosive_magazines = db.relationship(
        'ExplosivesPermitAmendmentMagazine',
        lazy='select',
        primaryjoin='and_(ExplosivesPermitAmendmentMagazine.explosives_permit_amendment_id == ExplosivesPermitAmendment.explosives_permit_amendment_id, ExplosivesPermitAmendmentMagazine.explosives_permit_amendment_magazine_type_code == "EXP", ExplosivesPermitAmendmentMagazine.deleted_ind == False)'
    )
    detonator_magazines = db.relationship(
        'ExplosivesPermitAmendmentMagazine',
        lazy='select',
        primaryjoin='and_(ExplosivesPermitAmendmentMagazine.explosives_permit_amendment_id == ExplosivesPermitAmendment.explosives_permit_amendment_id, ExplosivesPermitAmendmentMagazine.explosives_permit_amendment_magazine_type_code == "DET", ExplosivesPermitAmendmentMagazine.deleted_ind == False)'
    )

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.explosives_permit_amendment_id}>'

    @hybrid_property
    def issuing_inspector_name(self):
        if self.issuing_inspector_party_guid:
            party = Party.find_by_party_guid(self.issuing_inspector_party_guid)
            return party.name
        return None

    @classmethod
    def get_next_application_number(cls):
        now = datetime.now(timezone('US/Pacific'))
        month = now.strftime('%m')
        year = now.strftime('%Y')

        sequence = Sequence('explosives_permit_application_number_sequence')
        next_value = sequence.next_value()
        return func.concat(next_value, f'-{year}-{month}')

    @classmethod
    def update_amendment_status_by_explosives_permit_id(cls, explosives_permit_id, is_closed_status, amendment_guid_to_exclude = None):

        and_clause = None

        if amendment_guid_to_exclude is not None:
            and_clause = and_(
                cls.explosives_permit_id == explosives_permit_id,
                cls.is_closed != is_closed_status,
                cls.explosives_permit_amendment_guid != amendment_guid_to_exclude
            )
        else:
            and_clause = and_(
                cls.explosives_permit_id == explosives_permit_id,
                cls.is_closed != is_closed_status,
            )

        update_stmt = update(cls)\
            .where(and_clause)\
            .values(is_closed = is_closed_status)

        update_result = db.session.execute(update_stmt)
        db.session.commit()
        return update_result.rowcount

    @classmethod
    def create(cls,
               mine,
               permit_guid,
               explosives_permit_id,
               explosives_permit_guid,
               application_date,
               originating_system,
               latitude,
               longitude,
               description,
               issue_date,
               expiry_date,
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
            application_number = ExplosivesPermitAmendment.get_next_application_number()
            received_timestamp = datetime.utcnow()
            is_closed = False
            issue_date = None
            expiry_date = None
        if is_closed:
            if closed_timestamp is None:
                closed_timestamp = datetime.utcnow()
        else:
            closed_reason = None
            closed_timestamp = None

        permit_number = ExplosivesPermit.find_permit_number_by_explosives_permit_id(explosives_permit_id)

        explosives_permit_amendment = cls(
            permit_guid=permit_guid,
            explosives_permit_id=explosives_permit_id,
            explosives_permit_guid=explosives_permit_guid,
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

        mine.explosives_permits_amendments.append(explosives_permit_amendment)

        for magazine_data in explosive_magazines:
            magazine = ExplosivesPermitAmendmentMagazine.create_from_data('EXP', magazine_data)
            explosives_permit_amendment.explosive_magazines.append(magazine)

        for magazine_data in detonator_magazines:
            magazine = ExplosivesPermitAmendmentMagazine.create_from_data('DET', magazine_data)
            explosives_permit_amendment.detonator_magazines.append(magazine)

        for doc in documents:
            explosives_permit_amendment_document_type_code = doc.get('explosives_permit_amendment_document_type_code')
            mine_doc = MineDocument(
                mine_guid=mine.mine_guid,
                document_name=doc.get('document_name'),
                document_manager_guid=doc.get('document_manager_guid'))
            explosives_permit_amendment_doc = ExplosivesPermitAmendmentDocumentXref(
                mine_document_guid=mine_doc.mine_document_guid,
                explosives_permit_amendment_id=explosives_permit_amendment.explosives_permit_amendment_id,
                explosives_permit_amendment_document_type_code=explosives_permit_amendment_document_type_code)
            explosives_permit_amendment_doc.mine_document = mine_doc
            explosives_permit_amendment.documents.append(explosives_permit_amendment_doc)

        if add_to_session:
            explosives_permit_amendment.save(commit=False)
        return explosives_permit_amendment

    def delete(self, commit=True):
        super(ExplosivesPermitAmendment, self).delete(commit)

    @classmethod
    def find_by_explosives_permit_amendment_guid(cls, explosives_permit_amendment_guid):
        return cls.query.filter_by(
            explosives_permit_amendment_guid=explosives_permit_amendment_guid, deleted_ind=False).one_or_none()

    def update(self,
               amendment,
               amendment_with_date,
               explosives_permit_id,
               permit_guid,
               now_application_guid,
               issuing_inspector_party_guid,
               mine_manager_mine_party_appt_id,
               permittee_mine_party_appt_id,
               application_status,
               expiry_date,
               decision_reason,
               is_closed,
               closed_reason,
               closed_timestamp,
               latitude,
               longitude,
               application_date,
               description,
               letter_date,
               letter_body,
               issue_date,
               explosive_magazines=[],
               detonator_magazines=[],
               documents=[],
               generate_documents=False,
               add_to_session=True):

        # Update simple properties.
        self.permit_guid = permit_guid
        self.now_application_guid = now_application_guid
        self.issuing_inspector_party_guid = issuing_inspector_party_guid
        self.mine_manager_mine_party_appt_id = mine_manager_mine_party_appt_id
        self.permittee_mine_party_appt_id = permittee_mine_party_appt_id
        self.application_date = application_date
        self.description = description
        self.expiry_date = expiry_date
        self.latitude = latitude
        self.longitude = longitude
        self.issue_date = issue_date

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
                magazine.get('explosives_permit_amendment_magazine_id') for magazine in updated_magazines
            ]

            # Delete deleted magazines.
            for magazine in magazines:
                if magazine.explosives_permit_amendment_magazine_id not in updated_magazines_ids:
                    magazine.delete(commit=False)

            # Create or update existing magazines.
            for magazine_data in updated_magazines:
                explosives_permit_amendment_magazine_id = magazine_data.get('explosives_permit_amendment_magazine_id')
                if explosives_permit_amendment_magazine_id:
                    magazine = ExplosivesPermitAmendmentMagazine.find_by_explosives_permit_amendment_magazine_id(
                        explosives_permit_amendment_magazine_id)
                    magazine.update_from_data(magazine_data)
                else:
                    magazine = ExplosivesPermitAmendmentMagazine.create_from_data(type, magazine_data)
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
            explosives_permit_amendment_document_type_code = doc.get('explosives_permit_amendment_document_type_code')
            mine_document_guid = doc.get('mine_document_guid')
            if mine_document_guid:
                explosives_permit_amendment_doc = ExplosivesPermitAmendmentDocumentXref.find_by_mine_document_guid(
                    mine_document_guid)
                explosives_permit_amendment_doc.explosives_permit_amendment_document_type_code = explosives_permit_amendment_document_type_code
            else:
                mine_doc = MineDocument(
                    mine_guid=self.mine_guid,
                    document_name=doc.get('document_name'),
                    document_manager_guid=doc.get('document_manager_guid'))
                explosives_permit_amendment_doc = ExplosivesPermitAmendmentDocumentXref(
                    mine_document_guid=mine_doc.mine_document_guid,
                    explosives_permit_amendment_id=self.explosives_permit_id,
                    explosives_permit_amendment_document_type_code=explosives_permit_amendment_document_type_code)
                explosives_permit_amendment_doc.mine_document = mine_doc
                self.documents.append(explosives_permit_amendment_doc)

        # Check for application status changes or application is Approved to regenerate permit and letter.
        if application_status:
            if application_status != 'REC' and application_status != 'APP':
                self.decision_timestamp = datetime.utcnow()
                self.decision_reason = decision_reason

            if (self.application_status == 'REC'
                    or self.application_status == 'APP') and application_status == 'APP':
                from app.api.document_generation.resources.explosives_permit_amendment_document_resource import ExplosivesPermitAmendmentDocumentResource
                from app.api.mines.explosives_permit.resources.explosives_permit_document_type import ExplosivesPermitDocumentGenerateResource

                def create_permit_enclosed_letter():
                    mine = self.mine
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
                        'is_draft': False,
                        'amendment': amendment,
                        'amendment_with_date': amendment_with_date
                    }
                    explosives_permit_amendment_document_type = ExplosivesPermitDocumentType.get_with_context(
                        'LET', self.explosives_permit_amendment_guid)
                    template_data = explosives_permit_amendment_document_type.transform_template_data(
                        template_data, self)
                    token = ExplosivesPermitDocumentGenerateResource.get_explosives_document_generate_token(
                        explosives_permit_amendment_document_type.explosives_permit_document_type_code,
                        self.explosives_permit_amendment_guid, template_data)
                    current_app.logger.debug(
                        f'explosives_permit_amendment_document_type: {explosives_permit_amendment_document_type}, token (create_permit_enclosed_letter): {token}'
                    )
                    return ExplosivesPermitAmendmentDocumentResource.generate_explosives_permit_document(
                        token, True, False, False)

                def create_issued_permit():
                    template_data = {'is_draft': False, 'amendment': amendment}
                    explosives_permit_amendment_document_type = ExplosivesPermitDocumentType.get_with_context(
                        'PER', self.explosives_permit_amendment_guid)
                    template_data = explosives_permit_amendment_document_type.transform_template_data(
                        template_data, self)
                    token = ExplosivesPermitDocumentGenerateResource.get_explosives_document_generate_token(
                        explosives_permit_amendment_document_type.explosives_permit_document_type_code,
                        self.explosives_permit_amendment_guid, template_data)
                    current_app.logger.debug(
                        f'explosives_permit_amendment_document_type: {explosives_permit_amendment_document_type}, token (create_issued_permit): {token}'
                    )
                    return ExplosivesPermitAmendmentDocumentResource.generate_explosives_permit_document(
                        token, True, False, False)

                permit_number = ExplosivesPermit.find_permit_number_by_explosives_permit_id(explosives_permit_id)
                if generate_documents:
                    create_permit_enclosed_letter()
                    create_issued_permit()

        self.application_status = application_status

        if add_to_session:
            self.save(commit=False)
        return self
