from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineralTenureXref(AuditMixin, Base):
    __tablename__ = "mineral_tenure_xref"
    mineral_tenure_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    tenure_number_id = db.Column(db.Numeric(10), unique=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MineralTenureXref %r>' % self.tenure_number_id

    def json(self):
        return {'tenure_number_id': str(self.tenure_number_id)}

    @classmethod
    def find_by_tenure(cls, _id):
        return cls.query.filter_by(tenure_number_id=_id).first()

    @classmethod
    def create_mine_tenure(cls, mine_identity, tenure_number_id, user_kwargs, save=True):
        mine_tenure = cls(
            mineral_tenure_xref_guid=uuid.uuid4(),
            mine_guid=mine_identity.mine_guid,
            tenure_number_id=tenure_number_id,
            **user_kwargs
        )
        if save:
            mine_tenure.save(commit=False)
        return mine_tenure

    @validates('tenure_number_id')
    def validate_tenure_number_id(self, key, tenure_number_id):
        if len(str(tenure_number_id)) not in [6, 7]:
            raise AssertionError('Tenure number must be 6 or 7 digits long.')
        return tenure_number_id
