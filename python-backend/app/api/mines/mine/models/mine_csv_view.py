from datetime import datetime
from sqlalchemy.schema import FetchedValue

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from sqlalchemy.ext.hybrid import hybrid_property


class MineCSVView(Base):
    __tablename__ = ""
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_name = db.Column(db.String(60))
    mine_no = db.Column(db.String(10))
    mine_region = db.Column(db.String)
    major_mine_ind = db.Column(db.String)
    operating_status = db.Column(db.String)
    mine_operation_status_codes = db.Column(db.String)
    status_since = db.Column(db.String)
    mine_tenure_type = db.Column(db.String)
    mine_tenure_type_code = db.Column(db.String)
    mine_commodity = db.Column(db.String)
    mine_commodity_code = db.Column(db.String)
    mine_disturbance = db.Column(db.String)
    mine_disturbance_code = db.Column(db.String)
    permit_no = db.Column(db.String)
    permittee_name = db.Column(db.String)

    def csv_row(self):
        model = inspect(self.__class__)
        return "\"" + '","'.join(
            [getattr(self, c.name) or "" for c in model.columns]) + "\""
