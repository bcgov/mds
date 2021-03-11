from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db
from datetime import datetime


class AdministrativeAmendmentView(Base):
    __tablename__ = 'administrative_amendment_view'

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')
    mine_no = db.Column(db.String)
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')
    administrative_amendment_number = db.Column(db.String)
    lead_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=True)
    lead_inspector_name = db.Column(db.String)
    application_status_description = db.Column(db.String)
    application_type_description = db.Column(db.String)
    import_timestamp = db.Column(db.Date)
    received_date = db.Column(db.Date)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<AdministrativeAmendmentView %r>' % self.now_application_guid
