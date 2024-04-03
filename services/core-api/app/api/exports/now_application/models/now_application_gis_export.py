from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import Base
from app.extensions import db


class NowApplicationGisExport(Base):
    __tablename__ = 'now_application_gis_export_view'

    # TODO: Specify additional params (e.g., nullable) and proper data types
    # Notice of Work General
    now_application_guid = db.Column(db.String, primary_key=True)
    now_number = db.Column(db.String, nullable=False)
    messageid = db.Column(db.String)
    mms_cid = db.Column(db.String)
    now_application_status_code = db.Column(db.String)
    now_application_status_description = db.Column(db.String)
    type_of_application = db.Column(db.String)
    now_application_type_code = db.Column(db.String)
    now_application_type_description = db.Column(db.String)
    now_application_submitted_date = db.Column(db.String)
    property_name = db.Column(db.String)
    now_latitude = db.Column(db.String)
    now_longitude = db.Column(db.String)
    verified_date = db.Column(db.String)
    mine_purpose = db.Column(db.String)
    latest_response_date = db.Column(db.String)
    regional_contact = db.Column(db.String)

    # Notice of Work Details
    is_applicant_individual_or_company = db.Column(db.String)
    relationship_to_applicant = db.Column(db.String)
    tenure_number = db.Column(db.String)
    term_of_application = db.Column(db.String)
    proposed_start_date = db.Column(db.String)
    proposed_end_date = db.Column(db.String)
    proposed_annual_maximum_tonnage = db.Column(db.String)
    adjusted_annual_maximum_tonnage = db.Column(db.String)
    directions_to_site = db.Column(db.String)
    is_access_gated = db.Column(db.String)
    has_key_for_inspector = db.Column(db.String)

    # Notice of Work Activity Disturbance Data
    total_disturbed_area = db.Column(db.String)
    activity_cut_lines_polarization_survey_total_disturbed_area = db.Column(db.String)
    activity_settling_pond_total_disturbed_area = db.Column(db.String)
    activity_exploration_surface_drilling_total_disturbed_area = db.Column(db.String)
    activity_sand_gravel_quarry_operation_total_disturbed_area = db.Column(db.String)
    activity_exploration_access_total_disturbed_area = db.Column(db.String)
    activity_underground_exploration_total_disturbed_area = db.Column(db.String)
    activity_camp_total_disturbed_area = db.Column(db.String)
    activity_mechanical_trenching_total_disturbed_area = db.Column(db.String)
    activity_surface_bulk_sample_total_disturbed_area = db.Column(db.String)
    activity_placer_operation_total_disturbed_area = db.Column(db.String)

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

    # Notice of Work Client Delay
    now_application_client_delay_days = db.Column(db.String)

    # Permit
    permit_guid = db.Column(db.String)
    permit_no = db.Column(db.String)
    permit_status_code = db.Column(db.String)
    permit_status_code_description = db.Column(db.String)
    amendment_issue_date = db.Column(db.String)
    amendment_authorization_end_date = db.Column(db.String)

    # Permittee
    permittee_first_name = db.Column(db.String)
    permittee_name = db.Column(db.String)
    permittee_primary_phone_no = db.Column(db.String)
    permittee_secondary_phone_no = db.Column(db.String)
    permittee_tertiary_phone_no = db.Column(db.String)

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

    # Mine Work Status
    mine_work_start_date = db.Column(db.String)
    mine_work_stop_date = db.Column(db.String)
    mine_work_comments = db.Column(db.String)

    # Mine Inspection Data
    last_inspection_date = db.Column(db.String)
    last_inspection_type = db.Column(db.String)

    # Bonds
    bond_guids = db.Column(db.String)
    bond_amounts = db.Column(db.String)
    bond_status_codes = db.Column(db.String)
    bond_status_code_descriptions = db.Column(db.String)

    def csv_row(self):
        model = inspect(self.__class__)
        return [str(getattr(self, c.name) or "") for c in model.columns]
