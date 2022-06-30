from app.extensions import db
from sqlalchemy import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class NoticeOfDepartureContact(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'notice_of_departure_contact'

    nod_contact_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    nod_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('notice_of_departure.nod_guid'))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(254), nullable=False)
    phone_number = db.Column(db.String(12), nullable=False)
    is_primary = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.nod_contact_guid}'

    @classmethod
    def create(cls, nod_guid, first_name, last_name, email, phone_number, is_primary):
        new_contact = cls(
            nod_guid=nod_guid,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone_number,
            is_primary=is_primary)

        new_contact.save(commit=False)
        return new_contact

    def delete(self, commit=True):
        self.deleted_ind = True
