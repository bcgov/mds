from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class PartyBusinessRole(AuditMixin, Base):
    __tablename__ = 'party_business_role_code'

    party_business_role_code = db.Column(db.String(3), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<PartyBusinessRole %r>' % self.party_business_role_code

    @classmethod
    def find_by_party_business_role(cls, _id):
        return cls.query.filter_by(party_business_role_code=_id).first()
