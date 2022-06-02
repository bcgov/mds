DROP VIEW IF EXISTS public.now_application_gis_export_view;

CREATE INDEX IF NOT EXISTS idx_activity_summary_now_application_id
ON activity_summary (now_application_id);

CREATE INDEX IF NOT EXISTS idx_now_submissions_application_messageid
ON now_submissions.application (messageid);

CREATE INDEX IF NOT EXISTS idx_mine_mine_guid
ON mine (mine_guid);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_mine_guid
ON now_application_identity (mine_guid);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_now_application_id
ON now_application_identity (now_application_id);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_now_application_guid
ON now_application_identity (now_application_guid);

CREATE INDEX IF NOT EXISTS idx_mms_now_submissions_application_mms_cid
ON mms_now_submissions.application (mms_cid);

CREATE INDEX IF NOT EXISTS idx_mine_status_mine_guid_effective_date
ON mine_status (mine_guid, effective_date DESC);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_mms_cid
ON now_application_identity (mms_cid);

-- Moves the top-level sort into memory
SET LOCAL work_mem = "400MB";

CREATE MATERIALIZED VIEW IF NOT EXISTS public.now_application_gis_export_view
AS SELECT 
	nai.now_application_guid::character varying AS now_application_guid,
	LPAD(nai.now_number,15,'0') as now_number,
    nai.messageid,
    nai.mms_cid,
	CASE
		WHEN na.now_application_status_code IS NULL THEN
		CASE COALESCE(msub.status, sub.status)
			WHEN 'Accepted'::text THEN 'AIA'::character varying
			WHEN 'Approved'::text THEN 'AIA'::character varying
			WHEN 'Pending Verification' THEN 'PEV'::character varying
			WHEN 'Under Review'::text THEN 'PEV'::character varying
			WHEN 'Referral Complete'::text THEN 'PEV'::character varying
			WHEN 'Referred'::text THEN 'PEV'::character varying
			WHEN 'Client Delayed'::text THEN 'PEV'::character varying
			WHEN 'No Permit Required'::text THEN 'PEV'::character varying
			WHEN 'Govt. Action Required'::text THEN 'PEV'::character varying
			WHEN 'Permit Required'::text THEN 'PEV'::character varying
			WHEN 'Rejected'::text THEN 'REJ'::character varying
			WHEN 'Withdrawn'::text THEN 'WDN'::character varying
			ELSE COALESCE(msub.status, sub.status)
		END
		ELSE COALESCE(na.now_application_status_code, msub.status, sub.status)
	END AS now_application_status_code,
	CASE
		WHEN nas.description IS NULL THEN
		CASE COALESCE(msub.status, sub.status)
			WHEN 'Accepted'::text THEN 'Approved'::character varying
			WHEN 'Under Review'::text THEN 'Pending Verification'::character varying
			WHEN 'Referral Complete'::text THEN 'Pending Verification'::character varying
			WHEN 'Referred'::text THEN 'Pending Verification'::character varying
			WHEN 'Client Delayed'::text THEN 'Pending Verification'::character varying
			WHEN 'No Permit Required'::text THEN 'Pending Verification'::character varying
			WHEN 'Govt. Action Required'::text THEN 'Pending Verification'::character varying
			WHEN 'Rejected-Initial'::text THEN 'Rejected'::character varying
			WHEN 'Withdrawn'::text THEN 'Withdrawn'::character varying
			ELSE COALESCE(msub.status, sub.status)
		END
		ELSE COALESCE(nas.description, msub.status, sub.status)
	END AS now_application_status_description,
	CASE
		WHEN na.notice_of_work_type_code IS NULL THEN
		CASE COALESCE(msub.noticeofworktype, sub.noticeofworktype)
			WHEN 'Quarry - Construction Aggregate'::text THEN 'QCA'::character varying
			WHEN 'Coal'::text THEN 'COL'::character varying
			WHEN 'Placer Operations'::text THEN 'PLA'::character varying
			WHEN 'Mineral'::text THEN 'MIN'::character varying
			WHEN 'Sand & Gravel'::text THEN 'SAG'::character varying
			WHEN 'Quarry - Industrial Mineral'::text THEN 'QIM'::character varying
			ELSE COALESCE(msub.noticeofworktype, sub.noticeofworktype)
		END
		ELSE COALESCE(na.notice_of_work_type_code, msub.noticeofworktype, sub.noticeofworktype)
	END AS now_application_type_code,
	COALESCE(nat.description, sub.noticeofworktype, msub.noticeofworktype) AS now_application_type_description,
	COALESCE(msub.typeofapplication, sub.typeofapplication, na.type_of_application) AS type_of_application,
    COALESCE(msub.submitteddate, sub.submitteddate, na.submitted_date) AS now_application_submitted_date,
    na.imported_date::varchar AS verified_date,
    COALESCE(msub.nameofproperty, sub.nameofproperty, na.property_name) AS property_name,
    COALESCE(na.latitude, msub.latitude, sub.latitude) AS now_latitude,
    COALESCE(na.longitude, msub.longitude, sub.longitude) AS now_longitude,
    COALESCE(sub.applicantindividualorcompany, na.is_applicant_individual_or_company) AS is_applicant_individual_or_company,
    COALESCE(sub.applicantrelationship, na.relationship_to_applicant) AS relationship_to_applicant,
    COALESCE(sub.termofapplication, na.term_of_application) AS term_of_application,
    COALESCE(msub.proposedstartdate, sub.proposedstartdate, na.proposed_start_date) AS proposed_start_date,
    COALESCE(msub.proposedenddate, sub.proposedenddate, na.proposed_end_date) AS proposed_end_date,
    coalesce(msub.tenurenumbers, sub.tenurenumbers, na.tenure_number) AS tenure_number,
    COALESCE(sub.maxannualtonnage, na.proposed_annual_maximum_tonnage) AS proposed_annual_maximum_tonnage,
    COALESCE(sub.maxannualtonnage, na.adjusted_annual_maximum_tonnage) AS adjusted_annual_maximum_tonnage,
    COALESCE(msub.sitedirections, sub.sitedirections, na.directions_to_site) AS directions_to_site,
    CASE COALESCE(sub.isaccessgated::character varying, na.is_access_gated::character varying)
			WHEN 'No'::character varying THEN 'false'::character varying
			WHEN 'Yes'::character varying THEN 'true'::character varying
			ELSE COALESCE(sub.isaccessgated::character varying, na.is_access_gated::character varying)
	END as is_access_gated,
	CASE COALESCE(sub.accessauthorizationskeyprovided::character varying, na.has_key_for_inspector::character varying) 
	        WHEN 'No'::character varying THEN 'false'::character varying
			WHEN 'Yes'::character varying THEN 'true'::character varying
			ELSE COALESCE(sub.accessauthorizationskeyprovided::character varying, na.has_key_for_inspector::character varying) 
	END AS has_key_for_inspector,
	ROUND((CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_cut_lines_polarization_survey_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_cut_lines_polarization_survey_total_disturbed_area,
        activity_submission_disturbed_areas.now_submission_activity_cut_lines_polarization_survey_total_disturbed_area, 0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_settling_pond_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_settling_pond_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_settling_pond_total_disturbed_area, 0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_exploration_surface_drilling_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_exploration_surface_drilling_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_exploration_surface_drilling_total_disturbed_area,0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_sand_gravel_quarry_operation_total_disturbed_area,0) 
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_sand_gravel_quarry_operation_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_sand_gravel_quarry_operation_total_disturbed_area,0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_exploration_access_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_exploration_access_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_exploration_access_total_disturbed_area,0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_underground_exploration_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_underground_exploration_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_underground_exploration_total_disturbed_area,0)
	END  +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_camp_total_disturbed_area,0)
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_camp_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_camp_total_disturbed_area,0)
	END +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_mechanical_trenching_total_disturbed_area,0)
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_mechanical_trenching_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_mechanical_trenching_total_disturbed_area,0)
	END +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_surface_bulk_sample_total_disturbed_area,0)
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_surface_bulk_sample_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_surface_bulk_sample_total_disturbed_area,0)
	END +
	CASE
    WHEN na.now_application_id IS not NULL THEN
    COALESCE(activity_disturbed_areas.now_activity_placer_operation_total_disturbed_area,0)
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_placer_operation_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_placer_operation_total_disturbed_area,0)
	END)::DECIMAL,2)::TEXT as total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_cut_lines_polarization_survey_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_cut_lines_polarization_survey_total_disturbed_area,
        activity_submission_disturbed_areas.now_submission_activity_cut_lines_polarization_survey_total_disturbed_area)
	END as activity_cut_lines_polarization_survey_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_settling_pond_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_settling_pond_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_settling_pond_total_disturbed_area)
	END as activity_settling_pond_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_exploration_surface_drilling_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_exploration_surface_drilling_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_exploration_surface_drilling_total_disturbed_area)
	END as activity_exploration_surface_drilling_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_sand_gravel_quarry_operation_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_sand_gravel_quarry_operation_total_disturbed_area,
	    activity_submission_disturbed_areas.now_submission_activity_sand_gravel_quarry_operation_total_disturbed_area)
	END as activity_sand_gravel_quarry_operation_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_exploration_access_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_exploration_access_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_exploration_access_total_disturbed_area)
	END as activity_exploration_access_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_underground_exploration_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_underground_exploration_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_underground_exploration_total_disturbed_area)
	END as activity_underground_exploration_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_camp_total_disturbed_area
    ELSE
        COALESCE(activity_disturbed_areas.now_activity_camp_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_camp_total_disturbed_area)
	END as activity_camp_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_mechanical_trenching_total_disturbed_area
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_mechanical_trenching_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_mechanical_trenching_total_disturbed_area)
	END as activity_mechanical_trenching_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_surface_bulk_sample_total_disturbed_area
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_surface_bulk_sample_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_surface_bulk_sample_total_disturbed_area)
	END as activity_surface_bulk_sample_total_disturbed_area,
	CASE
    WHEN na.now_application_id IS not NULL THEN
    activity_disturbed_areas.now_activity_placer_operation_total_disturbed_area
    ELSE
       COALESCE(activity_disturbed_areas.now_activity_placer_operation_total_disturbed_area,
	   activity_submission_disturbed_areas.now_submission_activity_placer_operation_total_disturbed_area)
	END as activity_placer_operation_total_disturbed_area,
	nap_con.start_date AS now_progress_consultation_start_date,
    nap_con.end_date AS now_progress_consultation_end_date,
    nap_pub.start_date AS now_progress_public_comment_start_date,
    nap_pub.end_date AS now_progress_public_comment_end_date,
    nap_dft.start_date AS now_progress_draft_start_date,
    nap_dft.end_date AS now_progress_draft_end_date,
    nap_rev.start_date AS now_progress_review_start_date,
    nap_rev.end_date AS now_progress_review_end_date,
    nap_ref.start_date AS now_progress_referral_start_date,
    nap_ref.end_date AS now_progress_referral_end_date,
    nad.now_application_client_delay_days,
    p.permit_guid::character varying AS permit_guid,
    p.permit_no,
    p.permit_status_code,
    psc.description AS permit_status_code_description,
	pa.issue_date AS amendment_issue_date,
    pa.authorization_end_date AS amendment_authorization_end_date,
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    CASE
		WHEN pt.phone_ext IS null or trim(pt.phone_ext) = '' 
		THEN pt.phone_no 
		ELSE concat(pt.phone_no, coalesce(' (' || pt.phone_ext || ')'))
	END as permittee_primary_phone_no,
	CASE
		WHEN pt.phone_sec_ext IS NULL or trim(pt.phone_sec_ext) = '' 
		THEN pt.phone_no_sec
		ELSE concat(pt.phone_no_sec, coalesce(' (' || pt.phone_sec_ext || ')'))
	END as permittee_secondary_phone_no,
	CASE
		WHEN pt.phone_ter_ext IS null or trim(pt.phone_ter_ext) = '' 
		THEN pt.phone_no_ter 
		ELSE concat(pt.phone_no_ter, coalesce(' (' || pt.phone_ter_ext || ')'))
	END as permittee_tertiary_phone_no,
	pt.party_guid AS permittee_party_guid,
    m.mine_guid::character varying AS mine_guid,
    m.mine_name,
    m.mine_no AS mine_number,
    m.mine_region,
    mrc.description AS mine_region_description,
    m.latitude::character varying AS mine_latitude,
    m.longitude::character varying AS mine_longitude,
    m.create_timestamp::character varying AS mine_date,
    ms.effective_date::character varying AS status_date,
    m.major_mine_ind::character varying AS major_mine_ind,
	CASE
		WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
		ELSE 'Regional Mine'::text
	END AS mine_type,
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS mine_tenure_code,
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS mine_tenure_description,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS mine_commodity_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS mine_commodity_description,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS mine_disturbance_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS mine_disturbance_description,
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_description,
    mosr.description AS mine_operation_status_reason_description,
    mossr.description AS mine_operation_status_sub_reason_description,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status_description,
    mwi.work_start_date AS mine_work_start_date,
    mwi.work_stop_date AS mine_work_stop_date,
    mwi.work_comments AS mine_work_comments,
    nris_i.inspection_date AS last_inspection_date,
    nris_it.inspection_type_code AS last_inspection_type,
    array_to_string(array_agg(DISTINCT b.bond_guid), ','::text) AS bond_guids,
    array_to_string(array_agg(DISTINCT b.amount), ','::text) AS bond_amounts,
    array_to_string(array_agg(DISTINCT b.bond_status_code), ','::text) AS bond_status_codes,
    array_to_string(array_agg(DISTINCT bs.description), ','::text) AS bond_status_code_descriptions,
	CASE
		WHEN nai.now_application_id IS NOT NULL THEN false
		WHEN pa.now_application_guid IS NOT NULL THEN true
		WHEN sub.originating_system IS NULL AND msub.mms_cid IS NOT NULL AND (msub.status::text <> ALL (ARRAY['No Permit Required'::character varying::text, 'Approved'::character varying::text])) THEN false
		WHEN sub.originating_system IS NULL AND msub.mms_cid IS NOT NULL THEN true
		WHEN sub.originating_system IS NOT NULL AND nai.now_number IS NULL THEN true
		WHEN pa.now_application_guid IS NULL THEN false
		ELSE true
	END AS is_historic,
	CASE
		WHEN sub.originating_system IS NOT NULL THEN sub.originating_system
		WHEN msub.mms_cid IS NOT NULL THEN 'MMS'::character varying
		WHEN nai.now_application_id IS NOT NULL THEN 'Core'::character varying
		WHEN nai.messageid IS NOT NULL THEN 'VFCBC'::character varying
		ELSE NULL::character varying
	END AS originating_system
    FROM now_application_identity nai
     LEFT JOIN mine m ON m.mine_guid = nai.mine_guid
	 LEFT JOIN now_submissions.application sub ON nai.messageid = sub.messageid AND sub.processed::text = 'Y'::text
     LEFT JOIN mms_now_submissions.application msub ON nai.mms_cid = msub.mms_cid
     LEFT JOIN application_type_code atc ON atc.application_type_code::text = nai.application_type_code::text
	 LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
     LEFT JOIN mine_region_code mrc ON m.mine_region::text = mrc.mine_region_code::text
     LEFT JOIN now_application na ON nai.now_application_id = na.now_application_id
     LEFT JOIN now_application_status nas ON na.now_application_status_code::text = nas.now_application_status_code::text
     LEFT JOIN notice_of_work_type nat ON na.notice_of_work_type_code::text = nat.notice_of_work_type_code::text
     LEFT JOIN permit_amendment pa ON nai.now_application_guid = pa.now_application_guid AND pa.permit_amendment_status_code::text <> 'DFT'::text
	 LEFT JOIN permit_amendment spa ON nai.source_permit_amendment_id = spa.permit_amendment_id
	 LEFT JOIN permit p ON pa.permit_id = p.permit_id
     LEFT JOIN permit_status_code psc ON p.permit_status_code::text = psc.permit_status_code::text
     LEFT JOIN mine_party_appt mpa 
	 	ON p.permit_id = mpa.permit_id AND mpa.mine_party_appt_id = (( SELECT DISTINCT ON (mine_party_appt.end_date) mine_party_appt.mine_party_appt_id
           FROM mine_party_appt
          WHERE mine_party_appt.permit_id = p.permit_id
          ORDER BY mine_party_appt.end_date DESC
         LIMIT 1))
     LEFT JOIN bond_permit_xref bpx ON p.permit_id = bpx.permit_id
     LEFT JOIN bond b ON bpx.bond_id = b.bond_id
     LEFT JOIN bond_status bs ON b.bond_status_code::text = bs.bond_status_code::text
     LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
     LEFT JOIN ( SELECT DISTINCT ON (mine_status.mine_guid) mine_status.mine_guid,
            mine_status.mine_status_xref_guid,
            mine_status.effective_date
           FROM mine_status
          ORDER BY mine_status.mine_guid, mine_status.effective_date DESC) ms ON m.mine_guid = ms.mine_guid
     LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
	 
     LEFT JOIN (SELECT DISTINCT ON (mine_work_information.mine_guid)
		mine_work_information.mine_guid,
		mine_work_information.work_start_date,
		mine_work_information.work_stop_date,
		mine_work_information.work_comments
		FROM mine_work_information
		ORDER BY mine_work_information.mine_guid, mine_work_information.created_timestamp DESC) mwi
		ON m.mine_guid = mwi.mine_guid 
		
    LEFT JOIN (SELECT 
		now_application_id,
		now_activity_cut_lines_polarization_survey_total_disturbed_area,
		now_activity_settling_pond_total_disturbed_area,
		now_activity_exploration_surface_drilling_total_disturbed_area,
		now_activity_sand_gravel_quarry_operation_total_disturbed_area,
		now_activity_exploration_access_total_disturbed_area,
		now_activity_underground_exploration_total_disturbed_area,
		now_activity_camp_total_disturbed_area,
		now_activity_mechanical_trenching_total_disturbed_area,
		now_activity_surface_bulk_sample_total_disturbed_area,
		now_activity_placer_operation_total_disturbed_area
		FROM crosstab(
			 $$ SELECT 
				   a.now_application_id,
				   a.activity_type_code,
				   SUM(a.disturbed_area) as disturbed_area
			 FROM
				   (SELECT a.activity_type_code,
						 ad.disturbed_area,
						 a.now_application_id
						 FROM activity_summary a
						 LEFT JOIN activity_summary_detail_xref ax ON a.activity_summary_id = ax.activity_summary_id
						 LEFT JOIN activity_detail ad ON ax.activity_detail_id = ad.activity_detail_id
				   UNION ALL
						 SELECT a.activity_type_code,
								ad.disturbed_area,
								a.now_application_id
						 FROM activity_summary a
						 LEFT JOIN activity_summary_building_detail_xref bx ON bx.activity_summary_id = a.activity_summary_id
						 LEFT JOIN activity_detail ad ON bx.activity_detail_id = ad.activity_detail_id
				   UNION ALL
						 SELECT a.activity_type_code,
								ad.disturbed_area,
								a.now_application_id
						 FROM activity_summary a
						 LEFT JOIN activity_summary_staging_area_detail_xref stx ON stx.activity_summary_id = a.activity_summary_id
						 LEFT JOIN activity_detail ad ON stx.activity_detail_id = ad.activity_detail_id) a
			 GROUP BY 
				   a.now_application_id,
				   a.activity_type_code
			 ORDER BY now_application_id $$,
			 $$ VALUES
			 ('cut_lines_polarization_survey'::TEXT),
			 ('settling_pond'),
			 ('exploration_surface_drilling'),
			 ('sand_gravel_quarry_operation'),
			 ('exploration_access'),
			 ('underground_exploration'),
			 ('camp'),
			 ('mechanical_trenching'),
			 ('surface_bulk_sample'),
			 ('placer_operation') $$)
		AS disturbed_area (
			 "now_application_id" INT, 
			 "now_activity_cut_lines_polarization_survey_total_disturbed_area" NUMERIC,
			 "now_activity_settling_pond_total_disturbed_area" NUMERIC,
			 "now_activity_exploration_surface_drilling_total_disturbed_area" NUMERIC,
			 "now_activity_sand_gravel_quarry_operation_total_disturbed_area" NUMERIC,
			 "now_activity_exploration_access_total_disturbed_area" NUMERIC,
			 "now_activity_underground_exploration_total_disturbed_area" NUMERIC,
			 "now_activity_camp_total_disturbed_area" NUMERIC,
			 "now_activity_mechanical_trenching_total_disturbed_area" NUMERIC,
			 "now_activity_surface_bulk_sample_total_disturbed_area" NUMERIC,
			 "now_activity_placer_operation_total_disturbed_area" NUMERIC)) activity_disturbed_areas 
		ON activity_disturbed_areas.now_application_id = nai.now_application_id 
		
	 LEFT JOIN (SELECT 
   		a.now_application_id,
   		SUM(a.disturbed_area) as now_total_disturbed_area
	 	FROM (SELECT ad.disturbed_area,
				 a.now_application_id
				 FROM activity_summary a
				 LEFT JOIN activity_summary_detail_xref ax ON a.activity_summary_id = ax.activity_summary_id
				 LEFT JOIN activity_detail ad ON ax.activity_detail_id = ad.activity_detail_id
			UNION ALL
				 SELECT ad.disturbed_area,
						a.now_application_id
				 FROM activity_summary a
				 LEFT JOIN activity_summary_building_detail_xref bx ON bx.activity_summary_id = a.activity_summary_id
				 LEFT JOIN activity_detail ad ON bx.activity_detail_id = ad.activity_detail_id
			UNION ALL
				 SELECT ad.disturbed_area,
						a.now_application_id
				 FROM activity_summary a
				 LEFT JOIN activity_summary_staging_area_detail_xref stx ON stx.activity_summary_id = a.activity_summary_id
				 LEFT JOIN activity_detail ad ON stx.activity_detail_id = ad.activity_detail_id) a
			GROUP BY a.now_application_id) activity_disturbed_area_total
			ON activity_disturbed_area_total.now_application_id = nai.now_application_id 
			
	 LEFT JOIN (SELECT 	
		messageid,
		now_submission_activity_cut_lines_polarization_survey_total_disturbed_area,
		now_submission_activity_settling_pond_total_disturbed_area,
		now_submission_activity_exploration_surface_drilling_total_disturbed_area,
		now_submission_activity_sand_gravel_quarry_operation_total_disturbed_area,
		now_submission_activity_exploration_access_total_disturbed_area,
		now_submission_activity_underground_exploration_total_disturbed_area,
		now_submission_activity_camp_total_disturbed_area,
		now_submission_activity_mechanical_trenching_total_disturbed_area,
		now_submission_activity_surface_bulk_sample_total_disturbed_area,
		now_submission_activity_placer_operation_total_disturbed_area,
		(now_submission_activity_cut_lines_polarization_survey_total_disturbed_area +
			now_submission_activity_settling_pond_total_disturbed_area +
			now_submission_activity_exploration_surface_drilling_total_disturbed_area +
			now_submission_activity_sand_gravel_quarry_operation_total_disturbed_area +
			now_submission_activity_exploration_access_total_disturbed_area +
			now_submission_activity_underground_exploration_total_disturbed_area +
			now_submission_activity_camp_total_disturbed_area +
			now_submission_activity_mechanical_trenching_total_disturbed_area +
			now_submission_activity_surface_bulk_sample_total_disturbed_area +
			now_submission_activity_placer_operation_total_disturbed_area) AS now_submission_total_disturbed_area
		FROM (
		SELECT 
			SUM(app.cutlinesexplgriddisturbedarea) as now_submission_activity_cut_lines_polarization_survey_total_disturbed_area,
			SUM(app.pondstotaldistarea) as now_submission_activity_settling_pond_total_disturbed_area,
			SUM(app.expsurfacedrilltotaldistarea) as now_submission_activity_exploration_surface_drilling_total_disturbed_area,
			SUM(sand.disturbedarea) as now_submission_activity_sand_gravel_quarry_operation_total_disturbed_area,
			SUM(app.expaccesstotaldistarea) as now_submission_activity_exploration_access_total_disturbed_area,
			SUM(app.underexptotaldistarea) as now_submission_activity_underground_exploration_total_disturbed_area,
			SUM(app.campbuildstgetotaldistarea) as now_submission_activity_camp_total_disturbed_area,
			SUM(app.mechtrenchingtotaldistarea) as now_submission_activity_mechanical_trenching_total_disturbed_area,
			SUM(app.surfacebulksampletotaldistarea) as now_submission_activity_surface_bulk_sample_total_disturbed_area,
			SUM(placer.disturbedarea) as now_submission_activity_placer_operation_total_disturbed_area,
			app.messageid
		FROM now_submissions.application app
		LEFT JOIN (SELECT messageid, SUM(disturbedarea) as disturbedarea
		    FROM now_submissions.sand_grv_qry_activity
		    GROUP BY messageid) sand
			ON sand.messageid = app.messageid
		LEFT JOIN (SELECT messageid, SUM(placer.disturbedarea) as disturbedarea
			FROM now_submissions.proposed_placer_activity_xref xplacer
			LEFT JOIN now_submissions.placer_activity placer 
			ON xplacer.placeractivityid = placer.placeractivityid
			GROUP BY xplacer.messageid) placer
			ON placer.messageid = app.messageid
		GROUP BY app.messageid) disturbed_area) activity_submission_disturbed_areas
		ON sub.messageid = activity_submission_disturbed_areas.messageid
     LEFT JOIN ( SELECT now_application_progress.now_application_id,
            now_application_progress.start_date,
            now_application_progress.end_date
           FROM now_application_progress
          WHERE now_application_progress.application_progress_status_code::text = 'CON'::text) nap_con ON nap_con.now_application_id = nai.now_application_id
     LEFT JOIN ( SELECT now_application_progress.now_application_id,
            now_application_progress.start_date,
            now_application_progress.end_date
           FROM now_application_progress
          WHERE now_application_progress.application_progress_status_code::text = 'PUB'::text) nap_pub ON nap_pub.now_application_id = nai.now_application_id
     LEFT JOIN ( SELECT now_application_progress.now_application_id,
            now_application_progress.start_date,
            now_application_progress.end_date
           FROM now_application_progress
          WHERE now_application_progress.application_progress_status_code::text = 'DFT'::text) nap_dft ON nap_dft.now_application_id = nai.now_application_id
     LEFT JOIN ( SELECT now_application_progress.now_application_id,
            now_application_progress.start_date,
            now_application_progress.end_date
           FROM now_application_progress
          WHERE now_application_progress.application_progress_status_code::text = 'REV'::text) nap_rev ON nap_rev.now_application_id = nai.now_application_id
     LEFT JOIN ( SELECT now_application_progress.now_application_id,
            now_application_progress.start_date,
            now_application_progress.end_date
           FROM now_application_progress
          WHERE now_application_progress.application_progress_status_code::text = 'REF'::text) nap_ref ON nap_ref.now_application_id = nai.now_application_id
     LEFT JOIN (SELECT 
			now_application_guid,
			sum(date_part('day'::text, COALESCE(now_application_delay.end_date, now()) - now_application_delay.start_date) + 1::double precision) AS now_application_client_delay_days
		FROM now_application_delay
		GROUP BY now_application_guid) nad
		ON nad.now_application_guid = nai.now_application_guid
     LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
     LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
     LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
     LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
     LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
     LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
     LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::text
	 
     LEFT JOIN (SELECT DISTINCT ON (inspection.mine_no)
		inspection.mine_no::text as mine_no,
		inspection.inspection_date,
		inspection.inspection_type_id
		FROM nris.inspection
		ORDER BY 
			inspection.mine_no, 
			inspection.inspection_date DESC) nris_i
	  	ON nris_i.mine_no = m.mine_no::text

     LEFT JOIN nris.inspection_type nris_it ON nris_i.inspection_type_id = nris_it.inspection_type_id
  WHERE m.deleted_ind = false AND 
        nai.application_type_code != 'ADA' AND 
		(nai.messageid IS NOT NULL AND sub.processed::text = 'Y'::text OR nai.messageid IS NULL) AND 
		(sub.originating_system IS NULL OR sub.originating_system IS NOT NULL AND nai.now_number IS NOT NULL)
  GROUP BY nai.now_application_guid, 
           nai.now_number, 
		   na.status_reason, 
		   na.now_application_status_code, 
		   nas.description, 
		   na.type_of_application, 
		   na.notice_of_work_type_code, 
		   nat.description, na.submitted_date, 
		   sub.submitteddate,
		   msub.proposedstartdate, sub.proposedstartdate,
		   msub.proposedenddate, sub.proposedenddate,
		   msub.typeofapplication,
		   sub.typeofapplication,
		   msub.noticeofworktype, 
		   sub.noticeofworktype,
		   na.property_name,
		   msub.nameofproperty,
		   sub.nameofproperty,
		   na.latitude,
		   msub.latitude,
		   sub.latitude,
		   na.longitude,
		   msub.longitude,
		   sub.longitude,
		   na.is_applicant_individual_or_company, 
		   sub.applicantindividualorcompany,
		   na.relationship_to_applicant,
		   sub.applicantrelationship,
		   na.term_of_application,
		   sub.termofapplication,
		   na.proposed_start_date, 
		   na.imported_date,
		   na.proposed_end_date, 
		   na.proposed_annual_maximum_tonnage, 
		   na.adjusted_annual_maximum_tonnage, 
		   sub.maxannualtonnage,
		   na.directions_to_site, 
		   msub.sitedirections,
		   sub.sitedirections,
		   na.is_access_gated, 
		   na.tenure_number,
		   msub.tenurenumbers,
		   sub.tenurenumbers,
		   sub.isaccessgated,
		   sub.accessauthorizationskeyprovided,
		   na.has_key_for_inspector, 
		   activity_disturbed_area_total.now_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_total_disturbed_area,
		   activity_disturbed_areas.now_activity_cut_lines_polarization_survey_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_cut_lines_polarization_survey_total_disturbed_area,
		   activity_disturbed_areas.now_activity_settling_pond_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_settling_pond_total_disturbed_area,
		   activity_disturbed_areas.now_activity_exploration_surface_drilling_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_exploration_surface_drilling_total_dist,
		   activity_disturbed_areas.now_activity_sand_gravel_quarry_operation_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_sand_gravel_quarry_operation_total_dist,
		   activity_disturbed_areas.now_activity_exploration_access_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_exploration_access_total_disturbed_area,
		   activity_disturbed_areas.now_activity_underground_exploration_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_underground_exploration_total_disturbed,
		   activity_disturbed_areas.now_activity_camp_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_camp_total_disturbed_area,
		   activity_disturbed_areas.now_activity_mechanical_trenching_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_mechanical_trenching_total_disturbed_area,
		   activity_disturbed_areas.now_activity_surface_bulk_sample_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_surface_bulk_sample_total_disturbed_area,
		   activity_disturbed_areas.now_activity_placer_operation_total_disturbed_area, 
		   activity_submission_disturbed_areas.now_submission_activity_placer_operation_total_disturbed_area,
		   nap_con.start_date, nap_con.end_date, nap_pub.start_date, nap_pub.end_date, 
		   nap_dft.start_date, nap_dft.end_date, nap_rev.start_date, nap_rev.end_date, 
		   nap_ref.start_date, nap_ref.end_date, nad.now_application_client_delay_days, 
		   p.permit_guid, 
		   p.permit_no, 
		   p.permit_status_code, 
		   psc.description, 
		   pa.issue_date, 
		   pa.authorization_end_date, 
		   pt.first_name, 
		   pt.party_name, 
		   pt.party_guid, 
		   m.mine_guid, 
		   m.mine_name, 
		   m.mine_no, 
		   m.mine_region, 
		   mrc.description, 
		   na.now_application_id,
		   (m.latitude::character varying), 
		   (m.longitude::character varying), 
		   (m.create_timestamp::character varying), 
		   (ms.effective_date::character varying), 
		   m.major_mine_ind, (
        CASE
            WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
            ELSE 'Regional Mine'::text
        END), mos.mine_operation_status_code, 
		    mosr.mine_operation_status_reason_code, 
			mossr.mine_operation_status_sub_reason_code, 
			mos.description, 
			mosr.description, 
			mossr.description, 
			mwi.work_start_date, 
			mwi.work_stop_date, 
			mwi.work_comments, 
			nris_i.inspection_date, 
			nris_it.inspection_type_code,
			msub.noticeofworktype,
			sub.noticeofworktype,
			spa.permit_amendment_guid,
			spa.issue_date,
			atc.description,
			msub.status,
			sub.status,
			na.received_date,
			sub.receiveddate,
			msub.receiveddate,
			msub.submitteddate,
			pa.now_application_guid,
			sub.originating_system,
			msub.mms_cid,
			na.create_timestamp,
			na.update_timestamp;
