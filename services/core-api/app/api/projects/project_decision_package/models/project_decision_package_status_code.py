from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ProjectDecisionPackageStatusCode(AuditMixin, Base):
    __tablename__ = "project_decision_package_status_code"

    project_decision_package_status_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.project_decision_package_status_code}'

    @classmethod
    def get_all(cls):
        try:
            return cls.query.order_by(
                cls.project_decision_package_status_code).filter_by(active_ind=True).all()
        except ValueError:
            return None
