import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin


class PermitConditionTagXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_condition_tag_xref'
    permit_condition_tag_xref_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    permit_condition_tag_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit_condition_tag.permit_condition_tag_guid'), nullable=False)
    permit_condition_id = db.Column(db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'), nullable=False)

    permit_condition = db.relationship(
        'PermitConditions',
        back_populates='condition_tag_xrefs'
    )

    permit_condition_tag = db.relationship('PermitConditionTag', backref=db.backref('tag_xrefs', lazy='dynamic'))

    @classmethod
    def find_by_guid_and_condition_id(cls, tag_guid, condition_id):
        return PermitConditionTagXref.query.filter_by(
            permit_condition_tag_guid=uuid.UUID(tag_guid),
            permit_condition_id=condition_id
        ).first()

    @classmethod
    def deleteAllByGuid(cls, permit_condition_tag_guid):
        return PermitConditionTagXref.query.filter_by(permit_condition_tag_guid=uuid.UUID(permit_condition_tag_guid)).delete(True)