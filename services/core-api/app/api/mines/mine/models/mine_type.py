import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class MineType(AuditMixin, Base):
    __tablename__ = "mine_type"
    mine_type_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    mine_tenure_type_code = db.Column(
        db.String, db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)
    mine_type_detail = db.relationship(
        'MineTypeDetail',
        backref='mine_type',
        order_by='desc(MineTypeDetail.update_timestamp)',
        lazy='select')

    mine_tenure_type = db.relationship(
        'MineTenureTypeCode', backref='mine_types', load_on_pending=True)

    def __repr__(self):
        return '<MineType %r>' % self.mine_type_guid

    def get_active(self, records):
        return list(filter(lambda x: x.active_ind, records))

    @classmethod
    def create(cls, mine_guid, mine_tenure_type_code, add_to_session=True):
        mine_type = cls(mine_guid=mine_guid, mine_tenure_type_code=mine_tenure_type_code)
        if add_to_session:
            mine_type.save(commit=False)
        return mine_type

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_guid=_id).first()

    def expire_record(self):
        for detail in self.mine_type_detail:
            detail.expire_record()
        self.active_ind = False
        self.save()
