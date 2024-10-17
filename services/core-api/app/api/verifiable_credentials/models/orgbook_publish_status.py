from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from typing import List
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment


class PermitAmendmentOrgBookPublish(AuditMixin, Base):
    """Track mines act permit credentials being issued to orgbook"""
    __tablename__ = "permit_amendment_orgbook_publish_status"
    unsigned_payload_hash = db.Column(db.String, primary_key=True) #string on hex characters
    permit_amendment_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('permit_amendment.permit_amendment_guid'), nullable=False)
    party_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    sign_date = db.Column(db.DateTime, nullable=True)
    signed_credential = db.Column(db.String, nullable=True)
    publish_state = db.Column(
        db.Boolean, nullable=True)                                 # null = not published, true = published, false = failed
    orgbook_credential_id = db.Column(
        db.String, nullable=False)                                 # not sure this will be able to be populated

    def __repr__(self):
        return f'<PermitAmendmentOrgBookPublishStatus unsigned_payload_hash={self.unsigned_payload_hash}, permit_amendment_guid={self.permit_amendment_guid}, sign_date={self.sign_date}, publish_state={self.publish_state}>'

    @classmethod
    def find_by_unsigned_payload_hash(cls,
                                      unsigned_payload_hash,
                                      *,
                                      unsafe: bool = False) -> "PermitAmendmentOrgBookPublish":
        query = cls.query.unbound_unsafe() if unsafe else cls.query
        return query.filter_by(unsigned_payload_hash=unsigned_payload_hash).one_or_none()

    @classmethod
    def find_all_unpublished(cls, *, unsafe: bool = False) -> List["PermitAmendmentOrgBookPublish"]:
        query = cls.query.unbound_unsafe() if unsafe else cls.query
        return query.filter(PermitAmendmentOrgBookPublish.publish_state != True).all()
