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
    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'))
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
    def create(cls,
               mine_guid,
               mine_tenure_type_code,
               permit_guid=None,
               now_application_guid=None,
               add_to_session=True):
        mine_type = cls(
            mine_guid=mine_guid,
            mine_tenure_type_code=mine_tenure_type_code,
            permit_guid=permit_guid,
            now_application_guid=now_application_guid)
        if add_to_session:
            mine_type.save(commit=False)
        return mine_type

    @classmethod
    def find_by_guid(cls, _id):
        uuid.UUID(_id, version=4)
        return cls.query.filter_by(mine_type_guid=_id).first()

    def expire_record(self, commit=True):
        for detail in self.mine_type_detail:
            detail.expire_record()
        self.active_ind = False

        if commit:
            self.save()

    @classmethod
    def find_by_permit_guid(cls, permit_guid, mine_guid, active_ind=True):
        return cls.query.filter_by(
            permit_guid=permit_guid, mine_guid=mine_guid, active_ind=active_ind).one_or_none()

    @classmethod
    def update_mine_type_details(cls,
                                 mine_type_guid=None,
                                 permit_guid=None,
                                 now_application_guid=None,
                                 mine_tenure_type_code=None,
                                 mine_disturbance_codes=[],
                                 mine_commodity_codes=[]):
        mine_type = None

        def find_mine_type(mine_type_guid, permit_guid, now_application_guid):
            if mine_type_guid:
                return cls.find_by_guid(mine_type_guid)
            elif permit_guid:
                return cls.query.filter_by(permit_guid=permit_guid, active_ind=True).first()
            elif now_application_guid:
                return cls.query.filter_by(
                    now_application_guid=now_application_guid, active_ind=True).first()
            else:
                raise Exception(
                    'mine_type_guid or permit_guid or now_application_guid must be specified.')

        mine_type = find_mine_type(mine_type_guid, permit_guid, now_application_guid)

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
        return find_mine_type(mine_type_guid, permit_guid, now_application_guid)

    @classmethod
    def create_or_update_mine_type_with_details(cls,
                                                mine_guid,
                                                permit_guid=None,
                                                now_application_guid=None,
                                                mine_tenure_type_code=None,
                                                mine_disturbance_codes=[],
                                                mine_commodity_codes=[]):

        if (not permit_guid and not now_application_guid) or (permit_guid and now_application_guid):
            raise Exception(
                "At least/Only one of these must be provided: permit_guid, now_application_guid")

        site_property = cls.query.filter_by(
            now_application_guid=now_application_guid,
            permit_guid=permit_guid,
            mine_guid=mine_guid,
            active_ind=True).one_or_none()

        if not site_property:
            mine_type = MineType.create(
                mine_guid, mine_tenure_type_code, now_application_guid=now_application_guid)

            for d_code in mine_disturbance_codes:
                MineTypeDetail.create(mine_type, mine_disturbance_code=d_code)

            for c_code in mine_commodity_codes:
                MineTypeDetail.create(mine_type, mine_commodity_code=c_code)
        else:
            MineType.update_mine_type_details(
                permit_guid=permit_guid,
                now_application_guid=now_application_guid,
                mine_tenure_type_code=mine_tenure_type_code,
                mine_disturbance_codes=mine_disturbance_codes,
                mine_commodity_codes=mine_commodity_codes)
