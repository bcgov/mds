import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail


class MineType(AuditMixin, Base):
    __tablename__ = "mine_type"
    mine_type_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'))
    mine_tenure_type_code = db.Column(
        db.String, db.ForeignKey('mine_tenure_type_code.mine_tenure_type_code'), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, default=True)
    mine_type_detail = db.relationship(
        'MineTypeDetail',
        backref='mine_type',
        primaryjoin=
        ("and_(MineType.mine_type_guid==MineTypeDetail.mine_type_guid, MineTypeDetail.active_ind==True)"
         ),
        order_by='desc(MineTypeDetail.update_timestamp)',
        lazy='select')

    mine_tenure_type = db.relationship(
        'MineTenureTypeCode', backref='mine_types', load_on_pending=True)

    def __repr__(self):
        return '<MineType %r>' % self.mine_type_guid

    def get_active(self, records):
        return list(filter(lambda x: x.active_ind, records))

    @classmethod
    def create(cls, mine_guid, mine_tenure_type_code, permit_guid, add_to_session=True):
        mine_type = cls(
            mine_guid=mine_guid,
            mine_tenure_type_code=mine_tenure_type_code,
            permit_guid=permit_guid)
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

    @classmethod
    def update_mine_type_details(cls,
                                 mine_type_guid=None,
                                 mine_guid=None,
                                 permit_guid=None,
                                 mine_tenure_type_code=None,
                                 mine_disturbance_codes=[],
                                 mine_commodity_codes=[]):
        mine_type = None

        def find_mine_type(mine_type_guid, mine_guid, permit_guid):
            if mine_type_guid:
                return cls.find_by_guid(mine_type_guid)
            elif mine_guid:
                return cls.query.filter_by(mine_guid=mine_guid).first()
            elif permit_guid:
                return cls.query.filter_by(permit_guid=permit_guid).first()
            else:
                raise Exception('mine_guid or mine_type_guid or permit_guid must be specified.')

        mine_type = find_mine_type(mine_type_guid, mine_guid, permit_guid)

        if not mine_type:
            raise Exception('Site Property does not exist')

        if mine_tenure_type_code:
            mine_type.mine_tenure_type_code = mine_tenure_type_code

        existing_disturbance_codes = [
            detail.mine_disturbance_code for detail in mine_type.mine_type_detail
            if detail.mine_disturbance_code and detail.active_ind
        ]

        for detail in [
                detail for detail in mine_type.mine_type_detail if detail.mine_disturbance_code
                and detail.mine_disturbance_code not in mine_disturbance_codes
        ]:
            detail.active_ind = False
            db.session.add(detail)

        for code in mine_disturbance_codes:
            if code in existing_disturbance_codes:
                continue
            else:
                disturbance = MineTypeDetail.query.filter_by(
                    mine_type_guid=mine_type.mine_type_guid,
                    mine_disturbance_code=code,
                    active_ind=False).first()
                if disturbance:
                    disturbance.active_ind = True
                    db.session.add(disturbance)
                else:
                    db.session.add(
                        MineTypeDetail.create(
                            mine_type, mine_disturbance_code=code, add_to_session=False))

        existing_commodity_codes = [
            detail.mine_commodity_code for detail in mine_type.mine_type_detail
            if detail.mine_commodity_code and detail.active_ind
        ]

        for detail in [
                detail for detail in mine_type.mine_type_detail if detail.mine_commodity_code
                and detail.mine_commodity_code not in mine_commodity_codes
        ]:
            detail.active_ind = False
            db.session.add(detail)

        for code in mine_commodity_codes:
            if code in existing_commodity_codes:
                continue
            else:
                commodity = MineTypeDetail.query.filter_by(
                    mine_type_guid=mine_type.mine_type_guid,
                    mine_commodity_code=code,
                    active_ind=False).first()

                if commodity:
                    commodity.active_ind = True
                    db.session.add(commodity)
                else:
                    db.session.add(
                        MineTypeDetail.create(
                            mine_type, mine_commodity_code=code, add_to_session=False))

        db.session.commit()
        return find_mine_type(mine_type_guid, mine_guid, permit_guid)
