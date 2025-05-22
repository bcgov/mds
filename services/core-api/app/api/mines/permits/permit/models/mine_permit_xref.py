from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


class MinePermitXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "mine_permit_xref"

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), primary_key=True)
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'), primary_key=True)

    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)

    mine = db.relationship('Mine')

    @classmethod
    def create(cls, mine_guid, permit_id, start_date, end_date=None, add_to_session=True):
        new_xref = cls(start_date=start_date, end_date=end_date, mine_guid=mine_guid, permit_id=permit_id)

        if add_to_session:
            new_xref.save(commit=False)
        return new_xref
