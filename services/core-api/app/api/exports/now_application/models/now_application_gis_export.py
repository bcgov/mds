from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db


class NowApplicationGisExport(Base):
    __tablename__ = 'now_application_gis_export_view'

    # TODO: Specify additional params (e.g., nullable) and proper data types
    now_application_guid = db.Column(db.String, nullable=False)
    now_number = db.Column(db.String)
    now_application_status_code = db.Column(db.String)
    now_application_status_description = db.Column(db.String)
    type_of_application = db.Column(db.String)
    now_application_type_description = db.Column(db.String)
    now_application_type_code = db.Column(db.String)
    now_application_submitted_date = db.Column(db.String)
    property_name = db.Column(db.String)

    is_applicant_individual_or_company = db.Column(db.String)
    relationship_to_applicant = db.Column(db.String)
    description_of_land = db.Column(db.String)
    proposed_start_date = db.Column(db.String)
    proposed_end_date = db.Column(db.String)
    directions_to_site = db.Column(db.String)
    is_access_gated = db.Column(db.String)
    has_key_for_inspector = db.Column(db.String)

    # Notice of Work Progress
    now_progress_consultation_start_date = db.Column(db.String)
    now_progress_consultation_end_date = db.Column(db.String)
    now_progress_public_comment_start_date = db.Column(db.String)
    now_progress_public_comment_end_date = db.Column(db.String)
    now_progress_draft_start_date = db.Column(db.String)
    now_progress_draft_end_date = db.Column(db.String)
    now_progress_review_start_date = db.Column(db.String)
    now_progress_review_end_date = db.Column(db.String)
    now_progress_referral_start_date = db.Column(db.String)
    now_progress_referral_end_date = db.Column(db.String)

    # Permit
    permit_guid = db.Column(db.String)
    permit_no = db.Column(db.String)
    permit_status_code = db.Column(db.String)
    permit_status_code_description = db.Column(db.String)
    permit_issue_date = db.Column(db.String)

    # Permittee Address?

    # Permittee
    permittee_first_name = db.Column(db.String)
    permittee_name = db.Column(db.String)
    permittee_party_guid = db.Column(db.String)

    # Mine General
    mine_guid = db.Column(db.String)
    mine_name = db.Column(db.String)
    mine_number = db.Column(db.String)
    mine_region = db.Column(db.String)
    mine_region_description = db.Column(db.String)
    mine_latitude = db.Column(db.String)
    mine_longitude = db.Column(db.String)
    mine_date = db.Column(db.String)
    status_date = db.Column(db.String)
    major_mine_ind = db.Column(db.String)
    mine_type = db.Column(db.String)

    # Mine Tenure, Commodity, Disturbance
    mine_tenure_code = db.Column(db.String)
    mine_tenure_description = db.Column(db.String)
    mine_commodity_code = db.Column(db.String)
    mine_commodity_description = db.Column(db.String)
    mine_disturbance_code = db.Column(db.String)
    mine_disturbance_description = db.Column(db.String)

    # Mine Operation Status
    mine_operation_status_code = db.Column(db.String)
    mine_operation_status_reason_code = db.Column(db.String)
    mine_operation_status_sub_reason_code = db.Column(db.String)
    mine_operation_status_description = db.Column(db.String)
    mine_operation_status_reason_description = db.Column(db.String)
    mine_operation_status_sub_reason_description = db.Column(db.String)
    operation_status_code = db.Column(db.String)
    operation_status_description = db.Column(db.String)

    # Bonds
    bond_guids = db.Column(db.String)
    bond_amounts = db.Column(db.String)
    bond_status_codes = db.Column(db.String)
    bond_status_code_descriptions = db.Column(db.String)

    # TODO: Use CSV library?
    def csv_row(self):
        model = inspect(self.__class__)
        return [str(getattr(self, c.name) or "").rstrip(',') for c in model.columns]
