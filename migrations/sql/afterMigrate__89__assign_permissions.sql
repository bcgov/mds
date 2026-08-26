/**
Allow MDS user to CRUD anything on the mds schema
**/
GRANT ALL PRIVILEGES ON DATABASE mds TO mds;
GRANT ALL PRIVILEGES ON SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mds;

GRANT ALL PRIVILEGES ON SCHEMA NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA NOW_Submissions TO mds;

GRANT ALL PRIVILEGES ON SCHEMA MMS_NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA MMS_NOW_Submissions TO mds;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA MMS_NOW_Submissions TO mds;

/**
Allow NRIS user to CRUD anything on the nris schema
**/
GRANT ALL PRIVILEGES ON SCHEMA nris TO nris;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nris TO nris;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nris TO nris;

/**
Allow Document Manager user to CRUD anything on the docman schema
**/
GRANT ALL PRIVILEGES ON SCHEMA docman TO docman;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA docman TO docman;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA docman TO docman;

/**
Allow logstash user to READ anything on the mds schema
**/
GRANT USAGE ON SCHEMA public TO logstash;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO logstash;

/**
Allow metabase user to READ anything on the mds schema
**/
GRANT USAGE ON SCHEMA public TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase;
GRANT USAGE ON SCHEMA nris TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA nris TO metabase;
GRANT USAGE ON SCHEMA now_submissions TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA now_submissions TO metabase;
GRANT USAGE ON SCHEMA mms_now_submissions TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA mms_now_submissions TO metabase;
GRANT USAGE ON SCHEMA docman TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA docman TO metabase;

/**
Allow mds_data_analytics user to READ anything on the nris schema
**/
DO
$$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mds_data_analytics') THEN
        GRANT USAGE ON SCHEMA nris TO mds_data_analytics;
        GRANT SELECT ON ALL TABLES IN SCHEMA nris TO mds_data_analytics;
    END IF;
END
$$;

/**
Allow mds_data_analytics user to READ specific tables on the public schema
**/
DO
$$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mds_data_analytics') THEN
        GRANT USAGE ON SCHEMA public TO mds_data_analytics;
        GRANT SELECT ON
            public.activity_detail,
            public.activity_equipment_xref,
            public.activity_summary,
            public.activity_summary_building_detail_xref,
            public.activity_summary_detail_xref,
            public.activity_summary_staging_area_detail_xref,
            public.activity_type,
            public.address,
            public.address_type_code,
            public.ams_final_application,
            public.ams_final_application_document_type,
            public.ams_final_application_document_xref,
            public.ams_final_application_version,
            public.application_reason_code,
            public.application_reason_code_xref,
            public.application_source_type_code,
            public.application_type_code,
            public.article_act_code,
            public.blasting_operation,
            public.bond,
            public.bond_document_type,
            public.bond_history,
            public.bond_permit_xref,
            public.bond_status,
            public.bond_type,
            public.building_detail,
            public.camp,
            public.camp_detail,
            public.compliance_article,
            public.consequence_classification_status,
            public.core_user,
            public.dam,
            public.dam_version,
            public.document_manager,
            public.document_template,
            public.email_tracking,
            public.emli_contact,
            public.emli_contact_type,
            public.equipment,
            public.etl_activity_detail,
            public.etl_bond,
            public.etl_equipment,
            public.etl_location,
            public.etl_manager,
            public.etl_mine,
            public.etl_permit,
            public.etl_status,
            public.exemption_fee_status,
            public.exploration_access,
            public.exploration_surface_drilling,
            public.explosives_permit,
            public.explosives_permit_amendment,
            public.explosives_permit_amendment_document_xref,
            public.explosives_permit_amendment_magazine,
            public.explosives_permit_document_type,
            public.explosives_permit_document_xref,
            public.explosives_permit_magazine,
            public.explosives_permit_magazine_type,
            public.explosives_permit_status,
            public.government_agency_type,
            public.help,
            public.idir_membership,
            public.idir_membership_xref,
            public.idir_user_detail,
            public.information_requirements_table,
            public.information_requirements_table_document_type,
            public.information_requirements_table_document_xref,
            public.information_requirements_table_status_code,
            public.irt_requirements_xref,
            public.itrb_exemption_status,
            public.major_mine_application,
            public.major_mine_application_document_subtype,
            public.major_mine_application_document_type,
            public.major_mine_application_document_xref,
            public.major_mine_application_status_code,
            public.mine,
            public.mine_alert,
            public.mine_comment,
            public.mine_commodity_code,
            public.mine_commodity_tenure_type,
            public.mine_disturbance_code,
            public.mine_disturbance_tenure_type,
            public.mine_document,
            public.mine_document_bundle,
            public.mine_document_version,
            public.mine_incident,
            public.mine_incident_category,
            public.mine_incident_category_xref,
            public.mine_incident_determination_type,
            public.mine_incident_do_subparagraph,
            public.mine_incident_document_type_code,
            public.mine_incident_document_xref,
            public.mine_incident_followup_investigation_type,
            public.mine_incident_note,
            public.mine_incident_recommendation,
            public.mine_incident_status_code,
            public.mine_operation_status_code,
            public.mine_operation_status_reason_code,
            public.mine_operation_status_sub_reason_code,
            public.mine_party_appt,
            public.mine_party_appt_document_xref,
            public.mine_party_appt_type_code,
            public.mine_permit_xref,
            public.mine_region_code,
            public.mine_report,
            public.mine_report_category,
            public.mine_report_category_xref,
            public.mine_report_comment,
            public.mine_report_contact,
            public.mine_report_definition,
            public.mine_report_definition_compliance_article_xref,
            public.mine_report_document_xref,
            public.mine_report_due_date_type,
            public.mine_report_notification,
            public.mine_report_permit_requirement,
            public.mine_report_permit_requirement_version,
            public.mine_report_req_permit_condition_xref,
            public.mine_report_req_permit_condition_xref_version,
            public.mine_report_submission,
            public.mine_report_submission_status_code,
            public.mine_status,
            public.mine_status_xref,
            public.mine_tailings_storage_facility,
            public.mine_tailings_storage_facility_version,
            public.mine_tenure_type_code,
            public.mine_type,
            public.mine_type_detail_xref,
            public.mine_verified_status,
            public.mine_work_information,
            public.minespace_user,
            public.minespace_user_document_xref,
            public.minespace_user_mds_mine_access,
            public.minespace_user_request,
            public.minespace_user_role,
            public.minespace_user_role_xref,
            public.minespace_user_version,
            public.municipality,
            public.notice_of_departure,
            public.notice_of_departure_contact,
            public.notice_of_departure_document_xref,
            public.notice_of_work_tier,
            public.notice_of_work_type,
            public.now_application,
            public.now_application_delay,
            public.now_application_delay_type,
            public.now_application_document_identity_xref,
            public.now_application_document_sub_type,
            public.now_application_document_type,
            public.now_application_document_xref,
            public.now_application_identity,
            public.now_application_permit_type,
            public.now_application_placer_xref,
            public.now_application_progress,
            public.now_application_progress_status,
            public.now_application_review,
            public.now_application_review_type,
            public.now_application_settling_pond_xref,
            public.now_application_status,
            public.now_application_tier,
            public.now_application_tier_version,
            public.now_party_appointment,
            public.party,
            public.party_business_role_appt,
            public.party_business_role_code,
            public.party_orgbook_entity,
            public.party_type_code,
            public.party_verifiable_credential_connection,
            public.party_verifiable_credential_mines_act_permit,
            public.permit,
            public.permit_amendment,
            public.permit_amendment_document,
            public.permit_amendment_orgbook_publish_status,
            public.permit_amendment_status_code,
            public.permit_amendment_type_code,
            public.permit_condition_category,
            public.permit_condition_category_version,
            public.permit_condition_review_assignment,
            public.permit_condition_review_assignment_version,
            public.permit_condition_status_code,
            public.permit_condition_tag,
            public.permit_condition_tag_xref,
            public.permit_condition_type,
            public.permit_conditions,
            public.permit_conditions_version,
            public.permit_extraction_task,
            public.permit_status_code,
            public.placer_operation,
            public.project,
            public.project_contact,
            public.project_decision_package,
            public.project_decision_package_document_type,
            public.project_decision_package_document_xref,
            public.project_decision_package_status_code,
            public.project_link,
            public.project_summary,
            public.project_summary_authorization,
            public.project_summary_authorization_document_xref,
            public.project_summary_authorization_type,
            public.project_summary_contact,
            public.project_summary_document_type,
            public.project_summary_document_xref,
            public.project_summary_ministry_comment,
            public.project_summary_permit_type,
            public.project_summary_status_code,
            public.reclamation_invoice,
            public.regional_contact,
            public.regional_contact_type,
            public.regions,
            public.required_document_due_date_type,
            public.required_document_sub_category,
            public.requirements,
            public.sand_gravel_quarry_operation,
            public.settling_pond,
            public.settling_pond_detail,
            public.standard_permit_condition_tag_xref,
            public.standard_permit_conditions,
            public.state_of_land,
            public.sub_division_code,
            public.subscription,
            public.surface_bulk_sample,
            public.transaction,
            public.tsf_operating_status,
            public.underground_exploration,
            public.underground_exploration_detail,
            public.underground_exploration_type,
            public.unit_type,
            public."user",
            public.variance,
            public.variance_application_status_code,
            public.variance_document_category_code,
            public.variance_document_xref,
            public.water_supply_detail
        TO mds_data_analytics;
    END IF;
END
$$;