from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class InformationRequirementsTableStatusCode(AuditMixin, Base):
    __tablename__="information_requirements_table_status_code"

    status_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.status_code}'

    def get_all(cls):
        try:
            return cls.query.order_by(cls.status_code).filter_by(active_ind=True).all()
        except ValueError:
            return None
