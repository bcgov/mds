from app.extensions import db
from sqlalchemy.orm import load_only
from app.api.utils.models_mixins import AuditMixin, Base


class ProjectSummaryAuthorizationType(AuditMixin, Base):
    __tablename__ = 'project_summary_authorization_type'

    project_summary_authorization_type = db.Column(db.String(100), primary_key=True)
    description = db.Column(db.String, nullable=False)

    project_summary_authorization_type_group_id = db.Column(
        db.String,
        db.ForeignKey('project_summary_authorization_type.project_summary_authorization_type'))

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_authorization_type}'

    @classmethod
    def get_all(cls):
        return cls.query.all()
    
    @classmethod
    def get_by_group_id(cls, group_id):
        return cls.query.filter_by(project_summary_authorization_type_group_id=group_id).options(load_only("project_summary_authorization_type")).all()
