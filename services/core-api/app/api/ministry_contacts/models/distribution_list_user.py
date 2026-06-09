from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base

class DistributionListUser(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'distribution_list_user'

    distribution_list_user_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    distribution_list_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('distribution_list.distribution_list_guid'), nullable=False)
    emli_contact_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('emli_contact.contact_guid'), nullable=False)

    distribution_list = db.relationship('DistributionList', back_populates='users', lazy='joined')
    ministry_contact = db.relationship('MinistryContact', lazy='joined')

    @classmethod
    def create(cls, distribution_list_guid, emli_contact_guid, add_to_session=True):
        new_user = cls(
            distribution_list_guid=distribution_list_guid,
            emli_contact_guid=emli_contact_guid
        )
        if add_to_session:
            new_user.save(commit=False)
        return new_user

    @classmethod
    def find_by_list_and_contact(cls, distribution_list_guid, emli_contact_guid):
        return cls.query.filter_by(
            distribution_list_guid=distribution_list_guid, 
            emli_contact_guid=emli_contact_guid,
            deleted_ind=False
        ).first()

    @classmethod
    def find_by_contact_guid(cls, emli_contact_guid):
        return cls.query.filter_by(emli_contact_guid=emli_contact_guid, deleted_ind=False).all()
