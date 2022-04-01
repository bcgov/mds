from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.constants import *


class Nod(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'nod'

    nod_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'), nullable=False)
    nod_title = db.Column(db.String(50), nullable=False)
    mine = db.relationship('Mine', lazy='select')
    permit = db.relationship('Permit', lazy='joined')

    @classmethod
    def create(cls, mine, permit, nod_title, add_to_session=True):
        new_nod = cls(permit_guid=permit.permit_guid, mine_guid=mine.mine_guid, nod_title=nod_title)

        if add_to_session:
            new_nod.save(commit=False)
        return new_nod

    @classmethod
    def find_one(cls, __guid):
        return cls.query.filter_by(nod_guid=__guid, deleted_ind=False).first()

    @classmethod
    def find_all_by_mine_guid(cls, __guid):
        return cls.query.filter_by(mine_guid=__guid, deleted_ind=False).all()

    @classmethod
    def find_all_by_permit_guid(cls, __guid, mine_guid=None):
        query = cls.query.filter_by(permit_guid=__guid, deleted_ind=False)
        print(query)
        if mine_guid:
            query = cls.query.filter_by(permit_guid=__guid, mine_guid=mine_guid, deleted_ind=False)
        return query.all()
