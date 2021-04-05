import uuid

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode
from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode


class MineTypeDetail(AuditMixin, Base):
    __tablename__ = 'mine_type_detail_xref'
    mine_type_detail_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_type_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_type.mine_type_guid'), nullable=False)
    mine_disturbance_code = db.Column(
        db.String(3), db.ForeignKey('mine_disturbance_code.mine_disturbance_code'))
    mine_commodity_code = db.Column(
        db.String(2), db.ForeignKey('mine_commodity_code.mine_commodity_code'))

    active_ind = db.Column(db.Boolean, nullable=False, default=True)

    def __repr__(self):
        return '<MineTypeDetail %r>' % self.mine_type_detail_xref_guid

    @classmethod
    def create(cls,
               mine_type,
               mine_disturbance_code=None,
               mine_commodity_code=None,
               add_to_session=True):
        if not mine_type.mine_tenure_type:
            raise Exception('mine_tenure_type must be set before adding commodity and disturbances')
        if bool(mine_disturbance_code) == bool(mine_commodity_code):
            raise Exception(
                'MineTypeDetail must have exactly one of mine_disturbance_code, mine_commodity_code'
            )

        if mine_disturbance_code:
            mine_disturbance = MineDisturbanceCode.query.get(mine_disturbance_code)
            if not mine_disturbance or mine_type.mine_tenure_type not in mine_disturbance.tenure_types:
                raise AssertionError(
                    f'Mine Disturbance Code {mine_disturbance_code} not valid with Tenure Type {mine_type.mine_tenure_type_code}'
                )

        if mine_commodity_code:
            mine_commodity = MineCommodityCode.query.get(mine_commodity_code)
            if not mine_commodity or mine_type.mine_tenure_type not in mine_commodity.tenure_types:
                raise AssertionError(
                    f'Mine Commodity Code {mine_commodity_code} not valid with Tenure Type {mine_type.mine_tenure_type_code}'
                )

        new_mine_type_detail = cls(
            mine_disturbance_code=mine_disturbance_code,
            mine_commodity_code=mine_commodity_code,
        )
        mine_type.mine_type_detail.append(new_mine_type_detail)
        if add_to_session:
            new_mine_type_detail.save(commit=False)
        return new_mine_type_detail

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_detail_xref_guid=_id).first()

    def expire_record(self):
        self.active_ind = False
        self.save()

    # @classmethod
    # def update_mine_type_details(cls, mine_disturbance_codes, mine_commodity_codes):
    #      existing_disturbance_codes = [
    #         dist_code.mine_disturbance_code for dist_code in mine_type.mine_type_detail
    #         if dist_code.mine_disturbance_code and dist_code.active_ind
    #     ]

    #     for detail in [
    #             detail for detail in mine_type.mine_type_detail
    #             if detail.mine_disturbance_code not in mine_disturbance_codes
    #     ]:
    #         detail.expire_record()

    #     current_app.logger.debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    #     for code in mine_disturbance_codes:
    #         if code in existing_disturbance_codes:
    #             current_app.logger.debug(f'continue {code}')
    #             continue
    #         else:
    #             disturbance = MineTypeDetail.query.filter_by(
    #                 mine_type_guid=mine_type.mine_type_guid,
    #                 mine_disturbance_code=code,
    #                 active_ind=False).first()
    #             current_app.logger.debug(f'disturbance {disturbance.__dict__}')
    #             if disturbance:
    #                 current_app.logger.debug(f'in if statement')
    #                 disturbance.active_ind = True
    #                 disturbance.save()
    #             else:
    #                 current_app.logger.debug(f'in else statement')
    #                 MineTypeDetail.create(mine_type, mine_disturbance_code=code)

    #     existing_commodity_codes = [
    #         comm_code.mine_commodity_code for comm_code in mine_type.mine_type_detail
    #         if comm_code.mine_commodity_code and comm_code.active_ind
    #     ]

    #     for detail in [
    #             detail for detail in mine_type.mine_type_detail
    #             if detail.mine_commodity_code not in mine_commodity_codes
    #     ]:
    #         detail.expire_record()

    #     current_app.logger.debug("^^^^^^^^^^^^^^^^^^^^^^^^^")
    #     for code in mine_commodity_codes:
    #         if code in existing_commodity_codes:
    #             current_app.logger.debug(f'continue {code}')
    #             continue
    #         else:
    #             commodity = MineTypeDetail.query.filter_by(
    #                 mine_type_guid=mine_type.mine_type_guid,
    #                 mine_commodity_code=code,
    #                 active_ind=False).first()
    #             current_app.logger.debug(f'commodity {commodity.__dict__}')
    #             if commodity:
    #                 current_app.logger.debug(f'in if statement')
    #                 commodity.active_ind = True
    #                 commodity.save()
    #                 current_app.logger.debug(f'commodity {commodity.__dict__}')
    #             else:
    #                 current_app.logger.debug(f'in else statement')
    #                 MineTypeDetail.create(mine_type, mine_commodity_code=code)

    #     return MineType.find_by_guid(mine_type_guid)