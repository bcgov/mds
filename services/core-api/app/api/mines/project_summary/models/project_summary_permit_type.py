from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, SoftDeleteMixin, Base


class ProjectSummaryPermitType(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary_permit_type'

    project_summary_permit_type = db.Column(db.String(100), primary_key=True)
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_summary_permit_type}'

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def validate_permit_type(cls, permit_type):
        return permit_type in str(cls.query.all())
