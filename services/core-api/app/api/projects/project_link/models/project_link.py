from uuid import UUID

from sqlalchemy import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID

class ProjectLink(AuditMixin, Base):
    __tablename__ = 'project_link'

    project_link_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('project.project_guid'))
    related_project_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('project.project_guid'))



    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_link_guid}'

    @classmethod
    def create(cls,
               project_guid,
               related_project_guid,
               add_to_session=True):
        new_project_link = cls(
            project_guid=project_guid,
            related_project_guid=related_project_guid)

        if add_to_session:
            new_project_link.save(commit=False)
        return new_project_link

    def delete(self, commit=True):
        return super(ProjectLink, self).delete(commit)

