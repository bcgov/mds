from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class ProjectSummaryAuthorization(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary_authorization'

    project_summary_authorization_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    existing_permits_authorizations = db.Column(db.ARRAY(db.String), nullable=False)
    project_summary_guid = db.Column(
        db.ForeignKey('project_summary.project_summary_guid'), nullable=False)
    project_summary_permit_type = db.Column(db.ARRAY(db.String), nullable=False)
    project_summary_authorization_type = db.Column(
        db.ForeignKey('project_summary_authorization_type.project_summary_authorization_type'),
        nullable=False)
    amendment_changes = db.Column(db.ARRAY(db.String), nullable=True)
    amendment_severity = db.Column(db.String, nullable=True)
    is_contaminated = db.Column(db.Boolean, nullable=True)
    new_type = db.Column(db.String, nullable=True)
    authorization_description = db.Column(db.String, nullable=True)
    exemption_requested = db.Column(db.Boolean, nullable=True)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_authorization_guid}'

    @classmethod
    def create(cls,
               project_summary_guid,
               project_summary_permit_type,
               existing_permits_authorizations,
               add_to_session=True):
        new_authorization = cls(
            project_summary_guid=project_summary_guid,
            project_summary_permit_type=project_summary_permit_type,
            existing_permits_authorizations=existing_permits_authorizations)
        if add_to_session:
            new_authorization.save(commit=False)
        return new_authorization

    def update(self, existing_permits_authorizations, add_to_session=True):
        self.existing_permits_authorizations = existing_permits_authorizations

        if add_to_session:
            self.save(commit=True)
        return self

    def delete(self, commit=True):
        return super(ProjectSummaryAuthorization, self).delete(commit)

    @classmethod
    def find_by_project_summary_authorization_guid(cls, project_summary_authorization_guid):
        return cls.query.filter_by(
            project_summary_authorization_guid=project_summary_authorization_guid,
            deleted_ind=False).one_or_none()

    @classmethod
    def find_by_project_summary_guid(cls, project_summary_guid):
        return cls.query.filter_by(
            project_summary_guid=project_summary_guid, deleted_ind=False).all()
