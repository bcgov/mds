from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineCSVView(Base):
    __tablename__ = "bcgw_view"
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_name = db.Column(db.String(60))
    mine_no = db.Column(db.String(10))
    mine_region = db.Column(db.String)
    major_mine_ind = db.Column(db.String)
    operating_status = db.Column(db.String)
    operating_status_code = db.Column(db.String)
    effective_date = db.Column(db.String)
    tenure = db.Column(db.String)
    tenure_code = db.Column(db.String)
    commodity = db.Column(db.String)
    commodity_code = db.Column(db.String)
    disturbance = db.Column(db.String)
    disturbance_code = db.Column(db.String)
    permit_no = db.Column(db.String)
    permittee_party_name = db.Column(db.String)

    def csv_row(self):
        model = inspect(self.__class__)
        return "\"" + '","'.join([getattr(self, c.name) or "" for c in model.columns]) + "\""
