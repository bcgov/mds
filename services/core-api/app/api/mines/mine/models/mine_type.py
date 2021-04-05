import uuid
from flask import current_app

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
                                 mine_disturbance_codes=[],
                                 mine_commodity_codes=[]):
        mine_type = None
        current_app.logger.debug('$$$$$$$$$$$$$$$$$$$$$$')
        current_app.logger.debug(f'mine_type_guid: {mine_type_guid}  mine_guid: {mine_guid}')

        def find_mine_type(mine_type_guid, mine_guid):
            if mine_type_guid:
                uuid.UUID(mine_type_guid, version=4)
                return cls.find_by_guid(mine_type_guid)
            elif mine_guid:
                uuid.UUID(mine_guid, version=4)
                return cls.query.filter_by(mine_guid=mine_guid).first()
            else:
                raise Exception('Mine type does not exist')

        mine_type = find_mine_type(mine_type_guid, mine_guid)

        existing_disturbance_codes = [
            dist_code.mine_disturbance_code for dist_code in mine_type.mine_type_detail
            if dist_code.mine_disturbance_code and dist_code.active_ind
        ]

        for detail in [
                detail for detail in mine_type.mine_type_detail if detail.mine_disturbance_code
                and detail.mine_disturbance_code not in mine_disturbance_codes
        ]:
            detail.expire_record()

        current_app.logger.debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        for code in mine_disturbance_codes:
            if code in existing_disturbance_codes:
                current_app.logger.debug(f'continue {code}')
                continue
            else:
                disturbance = MineTypeDetail.query.filter_by(
                    mine_type_guid=mine_type.mine_type_guid,
                    mine_disturbance_code=code,
                    active_ind=False).first()
                current_app.logger.debug(f'disturbance code {code}')
                if disturbance:
                    current_app.logger.debug(f'in if statement')
                    current_app.logger.debug(f'disturbance {disturbance.__dict__}')
                    disturbance.active_ind = True
                    disturbance.save()
                else:
                    current_app.logger.debug(f'in else statement')
                    MineTypeDetail.create(mine_type, mine_disturbance_code=code)

        existing_commodity_codes = [
            comm_code.mine_commodity_code for comm_code in mine_type.mine_type_detail
            if comm_code.mine_commodity_code and comm_code.active_ind
        ]

        for detail in [
                detail for detail in mine_type.mine_type_detail if detail.mine_commodity_code
                and detail.mine_commodity_code not in mine_commodity_codes
        ]:
            detail.expire_record()

        current_app.logger.debug("^^^^^^^^^^^^^^^^^^^^^^^^^")
        for code in mine_commodity_codes:
            if code in existing_commodity_codes:
                current_app.logger.debug(f'continue {code}')
                continue
            else:
                commodity = MineTypeDetail.query.filter_by(
                    mine_type_guid=mine_type.mine_type_guid,
                    mine_commodity_code=code,
                    active_ind=False).first()
                current_app.logger.debug(f'commodity code {code}')

                if commodity:
                    current_app.logger.debug(f'in if statement')
                    current_app.logger.debug(f'commodity {commodity.__dict__}')
                    commodity.active_ind = True
                    commodity.save()
                else:
                    current_app.logger.debug(f'in else statement')
                    MineTypeDetail.create(mine_type, mine_commodity_code=code)

        return find_mine_type(mine_type_guid, mine_guid)
