from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class NOWApplicationIdentity(Base, AuditMixin):
    __tablename__ = "now_application_identity"

    now_application_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    messageid = db.Column(db.Integer)
    mms_cid = db.Column(db.Integer)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine = db.relationship('Mine', lazy='joined')

    def __repr__(self):
        return '<NOWApplicationIdentity %r>' % self.now_application_guid
