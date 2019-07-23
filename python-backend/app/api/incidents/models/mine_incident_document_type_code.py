from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


# FIXME: Why is this not returned from the API???
# TODO: Create a resource for this model, return values from API, update FE to use this endpoint
class MineIncidentDocumentTypeCode(AuditMixin, Base):
    __tablename__ = "mine_incident_document_type_code"
    mine_incident_document_type_code = db.Column(db.String, primary_key=True, nullable=False)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineIncidentDocumentTypeCode %r>' % self.mine_incident_document_type_code

    @classmethod
    def active(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()
