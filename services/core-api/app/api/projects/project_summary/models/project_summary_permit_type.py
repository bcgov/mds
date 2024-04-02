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
    
    # return true if valid, or error message if invalid
    @classmethod
    def validate_permit_types(cls, permit_types, is_ams):
        valid_types = str(cls.query.all())

        if not permit_types or len(permit_types) == 0:
            return 'Permit type is required'
        if is_ams and len(permit_types) > 1:
            return 'Environmental Management Act authorization must have only one permit type'
        for permit_type in permit_types:
            if permit_type not in valid_types:
                return f'Invalid project description permit type: {permit_type}'
        
        return True
