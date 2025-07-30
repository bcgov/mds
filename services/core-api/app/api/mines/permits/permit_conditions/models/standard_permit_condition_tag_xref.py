import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin


class StandardPermitConditionTagXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'standard_permit_condition_tag_xref'
    standard_permit_condition_tag_xref_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    permit_condition_tag_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit_condition_tag.permit_condition_tag_guid'), nullable=False)
    standard_permit_condition_id = db.Column(db.Integer, db.ForeignKey('standard_permit_conditions.standard_permit_condition_id'), nullable=False)

    standard_permit_condition = db.relationship(
        'StandardPermitConditions',
        back_populates='condition_tag_xrefs'
    )

    permit_condition_tag = db.relationship('PermitConditionTag', backref=db.backref('standard_tag_xrefs', lazy='dynamic'))

    @classmethod
    def find_by_guid_and_condition_id(cls, tag_guid, condition_id):
        return StandardPermitConditionTagXref.query.filter_by(
            permit_condition_tag_guid=uuid.UUID(tag_guid),
            standard_permit_condition_id=condition_id
        ).first()

    @classmethod
    def delete_all_by_guid(cls, permit_condition_tag_guid):
        return StandardPermitConditionTagXref.query.filter_by(permit_condition_tag_guid=uuid.UUID(permit_condition_tag_guid)).delete()
