from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

class ProjectSummaryMinistryComment(AuditMixin, SoftDeleteMixin, Base):
    __tablename__ = "project_summary_ministry_comment"

    project_summary_ministry_comment_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    project_summary_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project_summary.project_summary_guid'))
    content = db.Column(db.String, nullable=False)

    @classmethod
    def get_by_project_summary_guid(cls, project_summary_guid):
        return cls.query.filter_by(project_summary_guid=project_summary_guid, deleted_ind=False).all()

    @classmethod
    def create(cls, project_summary, content):
        project_summary_comment = cls(
            project_summary_guid=project_summary.project_summary_guid,
            content=content
        )

        project_summary_comment.save()
        return project_summary_comment;