from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db, cache

from app.api.constants import MINE_DETAILS_JSON, TIMEOUT_60_MINUTES


class MineSummaryView(Base):
    __tablename__ = 'mine_summary_view'

    mine_guid = db.Column(db.String, primary_key=True)
    permit_guid = db.Column(db.String, primary_key=True)
    permit_id = db.Column(db.Integer)
    mine_name = db.Column(db.String)
    mine_number = db.Column(db.String)
    mine_latitude = db.Column(db.String)
    mine_longitude = db.Column(db.String)
    government_agency_type_code = db.Column(db.String)
    government_agency_type_d = db.Column(db.String)
    mine_exemption_fee_status_note = db.Column(db.String)
    mine_exemption_fee_status_code = db.Column(db.String)
    mine_exemption_fee_status_d = db.Column(db.String)

    operation_status = db.Column(db.String)
    operation_status_code = db.Column(db.String)
    mine_operation_status_code = db.Column(db.String)
    mine_operation_status_d = db.Column(db.String)
    mine_operation_status_reason_code = db.Column(db.String)
    mine_operation_status_reason_d = db.Column(db.String)
    mine_operation_status_sub_reason_code = db.Column(db.String)
    mine_operation_status_sub_reason_d = db.Column(db.String)
    mine_date = db.Column(db.String)
    status_date = db.Column(db.String)

    mine_tenure = db.Column(db.String)
    mine_tenure_type_code = db.Column(db.String)
    mine_commodity = db.Column(db.String)
    mine_commodity_type_code = db.Column(db.String)
    mine_disturbance = db.Column(db.String)
    mine_disturbance_type_code = db.Column(db.String)

    permit_tenure = db.Column(db.String)
    permit_tenure_type_code = db.Column(db.String)
    permit_commodity = db.Column(db.String)
    permit_commodity_type_code = db.Column(db.String)
    permit_disturbance = db.Column(db.String)
    permit_disturbance_type_code = db.Column(db.String)

    mine_region = db.Column(db.String)
    major_mine_ind = db.Column(db.String)
    bcmi_url = db.Column(db.String)
    major_mine_d = db.Column(db.String)

    permit_no = db.Column(db.String)
    permit_status_code = db.Column(db.String)
    permit_status_changed_timestamp = db.Column(db.DateTime)
    issue_date = db.Column(db.DateTime)
    permit_exemption_fee_status_code = db.Column(db.String)
    permit_exemption_fee_status_d = db.Column(db.String)
    permit_exemption_fee_status_note = db.Column(db.String)

    permittee_party_guid = db.Column(db.String)
    permittee_first_name = db.Column(db.String)
    permittee_name = db.Column(db.String)

    permittee_address_suite = db.Column(db.String)
    permittee_address_line_1 = db.Column(db.String)
    permittee_address_line_2 = db.Column(db.String)
    permittee_address_city = db.Column(db.String)
    permittee_address_post_code = db.Column(db.String)
    permittee_address_prov = db.Column(db.String)

    def csv_row(self):
        model = inspect(self.__class__)
        return [str(getattr(self, c.name) or "").rstrip(',') for c in model.columns]

    @staticmethod
    def get_paginated_data(page, per_page):
        cache_name = f'{MINE_DETAILS_JSON}:{page}:{per_page}'
        cache_data = cache.get(cache_name)
        if not cache_data:
            records = MineSummaryView.query.paginate(page, per_page, error_out=False)
            cache_data = dict([('total', records.total), ('current_page', records.page), ('per_page', records.per_page), ('mines', records.items)])
            cache.set(cache_name, cache_data, timeout=TIMEOUT_60_MINUTES)

        return cache_data