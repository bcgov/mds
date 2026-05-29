from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base

class DistributionList(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'distribution_list'

    distribution_list_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    distribution_list_name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(255))

    users = db.relationship('DistributionListUser', back_populates='distribution_list', lazy='selectin')

    @classmethod
    def create(cls, distribution_list_name, description=None, add_to_session=True):
        new_list = cls(
            distribution_list_name=distribution_list_name,
            description=description
        )
        if add_to_session:
            new_list.save(commit=False)
        return new_list

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(deleted_ind=False).order_by(cls.distribution_list_name).all()

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(distribution_list_name=name, deleted_ind=False).first()

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(distribution_list_guid=guid, deleted_ind=False).first()

    def get_emails(self):
        return [user.ministry_contact.email for user in self.users if user.ministry_contact and user.ministry_contact.email]
