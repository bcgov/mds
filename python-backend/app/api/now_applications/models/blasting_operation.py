from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class BlastingOperation(AuditMixin, Base):
    __tablename__ = 'blasting_operation'
    blasting_operation_id = db.Column(db.Integer, primary_key=True)
    now_application_id = db.Column(db.Integer,
                                   db.ForeignKey('now_application.now_application_id'),
                                   nullable=False)
   has_storage_explosive_on_site = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
   explosive_permit_issued = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
   explosive_permit_number = db.Column(db.String)
   explosive_permit_expiry_date = db.Column(db.DateTime)

    now_application = db.relationship('NOWApplication')