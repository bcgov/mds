from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineSummaryCSVView(Base):
    __tablename__ = "mine_summary_view"
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    permit_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_name = db.Column(db.String(60))
    mine_number = db.Column(db.String(10))
    mine_region = db.Column(db.String)
    major_mine_ind = db.Column(db.String)
    major_mine_d = db.Column(db.String)
    operation_status_code = db.Column(db.String)
    operation_status = db.Column(db.String)
    mine_operation_status_code = db.Column(db.String)
    mine_operation_status_d = db.Column(db.String)
    mine_operation_status_reason_code = db.Column(db.String)
    mine_operation_status_reason_d = db.Column(db.String)
    mine_operation_status_sub_reason_code = db.Column(db.String)
    mine_operation_status_sub_reason_d = db.Column(db.String)
    status_date = db.Column(db.String)
    tenure_type_code = db.Column(db.String)
    tenure = db.Column(db.String)
    commodity_type_code = db.Column(db.String)
    commodity = db.Column(db.String)
    disturbance_type_code = db.Column(db.String)
    disturbance = db.Column(db.String)
    permit_no = db.Column(db.String)
    permittee_name = db.Column(db.String)
    mine_latitude = db.Column(db.String)
    mine_longitude = db.Column(db.String)
    bcmi_url = db.Column(db.String)

    def csv_row(self):
        model = inspect(self.__class__)
        return "\"" + '","'.join([(getattr(self, c.name) or "").rstrip(',')
                                  for c in model.columns]) + "\""
