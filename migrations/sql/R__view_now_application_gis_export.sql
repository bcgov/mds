DROP VIEW IF EXISTS public.now_application_gis_export_view;

CREATE OR REPLACE VIEW public.now_application_gis_export_view
AS SELECT
    -- Notice of Work General
    nai.now_application_guid::varchar AS now_application_guid, 
    nai.now_number AS now_number,
    na.now_application_status_code AS now_application_status_code,
    nas.description AS now_application_status_description,
    na.type_of_application AS type_of_application,
    na.notice_of_work_type_code AS now_application_type_code,
    nat.description AS now_application_type_description,
    na.submitted_date AS now_application_submitted_date,
    na.property_name AS property_name,
    na.latitude::varchar AS now_latitude,
    na.longitude::varchar AS now_longitude,

    -- Notice of Work Details
    na.is_applicant_individual_or_company::varchar AS is_applicant_individual_or_company,
    na.relationship_to_applicant::varchar AS relationship_to_applicant,
    na.description_of_land AS description_of_land,
    na.term_of_application::varchar AS term_of_application,
    na.proposed_start_date AS proposed_start_date,
    na.proposed_end_date AS proposed_end_date,
    na.proposed_annual_maximum_tonnage::varchar AS proposed_annual_maximum_tonnage,
    na.adjusted_annual_maximum_tonnage::varchar AS adjusted_annual_maximum_tonnage,
    na.directions_to_site AS directions_to_site,
    na.is_access_gated::varchar AS is_access_gated,
    na.has_key_for_inspector::varchar AS has_key_for_inspector,

    -- Notice of Work Progress
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

    -- Permit
    -- TODO: Do we need to determine and provide "permit approved date" and "permit expiry date"?
    p.permit_guid::varchar AS permit_guid,
    p.permit_no AS permit_no,
    p.permit_status_code AS permit_status_code,
    psc.description AS permit_status_code_description,
    pa.issue_date AS amendment_issue_date,
    pa.authorization_end_date AS amendment_authorization_end_date,
    
    -- Permittee
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    pt.party_guid AS permittee_party_guid,

    -- Mine General
    m.mine_guid::varchar AS mine_guid,
    m.mine_name AS mine_name,
    m.mine_no AS mine_number,
    m.mine_region AS mine_region,
    mrc.description AS mine_region_description,
    m.latitude::varchar AS mine_latitude,
    m.longitude::varchar AS mine_longitude,
    m.create_timestamp ::varchar AS mine_date,
    ms.effective_date::varchar AS status_date,
    m.major_mine_ind::varchar AS major_mine_ind,
    CASE
        WHEN m.major_mine_ind IS true THEN 'Major Mine'::text
        ELSE 'Regional Mine'::text
    END AS mine_type,
    
    -- Mine Tenure, Commodity, Disturbance
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS mine_tenure_code,
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS mine_tenure_description,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS mine_commodity_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS mine_commodity_description,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS mine_disturbance_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS mine_disturbance_description,
    
    -- Mine Operation Status
    mos.mine_operation_status_code AS mine_operation_status_code,
    mosr.mine_operation_status_reason_code AS mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code AS mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_description,
    mosr.description AS mine_operation_status_reason_description,
    mossr.description AS mine_operation_status_sub_reason_description,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status_description,
    
    -- Bonds
    array_to_string(array_agg(DISTINCT b.bond_guid), ','::text) AS bond_guids,
    array_to_string(array_agg(DISTINCT b.amount), ','::text) AS bond_amounts,
    array_to_string(array_agg(DISTINCT b.bond_status_code), ','::text) AS bond_status_codes,
    array_to_string(array_agg(DISTINCT bs.description), ','::text) AS bond_status_code_descriptions
    
    FROM now_application_identity nai
    LEFT JOIN mine m on m.mine_guid = nai.mine_guid 
    LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
    LEFT JOIN mine_region_code mrc on m.mine_region = mrc.mine_region_code
    LEFT JOIN now_application na on nai.now_application_id = na.now_application_id
    LEFT JOIN now_application_status nas ON na.now_application_status_code = nas.now_application_status_code
    LEFT JOIN notice_of_work_type nat ON na.notice_of_work_type_code = nat.notice_of_work_type_code
    LEFT JOIN permit_amendment pa on nai.now_application_guid = pa.now_application_guid AND pa.permit_amendment_status_code != 'DFT' -- Do not include permit details until the NoW is approved!
    LEFT JOIN permit p ON pa.permit_id = p.permit_id
    LEFT JOIN permit_status_code psc ON p.permit_status_code = psc.permit_status_code
    LEFT JOIN mine_party_appt mpa ON p.permit_id = mpa.permit_id AND mpa.mine_party_appt_id = (SELECT DISTINCT ON(end_date) mine_party_appt_id FROM mine_party_appt where permit_id=p.permit_id ORDER BY end_date DESC NULLS FIRST LIMIT 1)
    LEFT JOIN bond_permit_xref bpx on p.permit_id = bpx.permit_id
    LEFT JOIN bond b on bpx.bond_id = b.bond_id
    LEFT JOIN bond_status bs on b.bond_status_code = bs.bond_status_code
    LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
    LEFT JOIN (
        SELECT DISTINCT ON (mine_status.mine_guid)
            mine_status.mine_guid,
            mine_status.mine_status_xref_guid,
            mine_status.effective_date
        FROM mine_status
        ORDER BY mine_status.mine_guid, mine_status.effective_date DESC
    ) ms ON m.mine_guid = ms.mine_guid
    LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid    
    LEFT JOIN (
        SELECT now_application_id, start_date, end_date
        FROM now_application_progress
        WHERE application_progress_status_code = 'CON'
    ) nap_con ON nap_con.now_application_id = nai.now_application_id
    LEFT JOIN (
        SELECT now_application_id, start_date, end_date
        FROM now_application_progress
        WHERE application_progress_status_code = 'PUB'
    ) nap_pub ON nap_pub.now_application_id = nai.now_application_id
    LEFT JOIN (
        SELECT now_application_id, start_date, end_date
        FROM now_application_progress
        WHERE application_progress_status_code = 'DFT'
    ) nap_dft ON nap_dft.now_application_id = nai.now_application_id
    LEFT JOIN (
        SELECT now_application_id, start_date, end_date
        FROM now_application_progress
        WHERE application_progress_status_code = 'REV'
    ) nap_rev ON nap_rev.now_application_id = nai.now_application_id
    LEFT JOIN (
        SELECT now_application_id, start_date, end_date
        FROM now_application_progress
        WHERE application_progress_status_code = 'REF'
    ) nap_ref ON nap_ref.now_application_id = nai.now_application_id
    LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
    LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
    LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
    LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
    LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
    LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
    LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::TEXT
    
    WHERE m.deleted_ind = false
    AND now_number IS NOT NULL
    AND nai.now_application_id IS NOT NULL
    
    GROUP BY
    -- Notice of Work General
    nai.now_application_guid, 
    now_number,
    na.now_application_status_code,
    now_application_status_description,
    type_of_application,
    now_application_type_code,
    now_application_type_description,
    now_application_submitted_date,
    property_name,
    now_latitude,
    now_longitude,
    
    -- Notice of Work Details
    is_applicant_individual_or_company,
    relationship_to_applicant,
    description_of_land,
    term_of_application,
    proposed_start_date,
    proposed_end_date,
    proposed_annual_maximum_tonnage,
    adjusted_annual_maximum_tonnage,
    directions_to_site,
    is_access_gated,
    has_key_for_inspector,

    -- Notice of Work Progress
    now_progress_consultation_start_date,
    now_progress_consultation_end_date,
    now_progress_public_comment_start_date,
    now_progress_public_comment_end_date,
    now_progress_draft_start_date,
    now_progress_draft_end_date,
    now_progress_review_start_date,
    now_progress_review_end_date,
    now_progress_referral_start_date,
    now_progress_referral_end_date,

    -- Permit
    p.permit_guid,
    permit_no,
    p.permit_status_code,
    permit_status_code_description,
	pa.issue_date,
	pa.authorization_end_date,

    -- Permittee
    permittee_first_name,
    permittee_name,
    permittee_party_guid,

    -- Mine General
    m.mine_guid,
    mine_name,
    mine_number,
    mine_region,
    mine_region_description,
    mine_latitude,
    mine_longitude,
    mine_date,
    status_date,
    major_mine_ind,
    mine_type,
    
    -- Mine Operation Status
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mine_operation_status_description,
    mine_operation_status_reason_description,
    mine_operation_status_sub_reason_description;
