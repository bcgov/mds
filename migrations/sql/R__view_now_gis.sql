DROP VIEW IF EXISTS public.now_gis_view;

CREATE OR REPLACE VIEW public.now_gis_view
AS SELECT
    nai.now_application_guid::varchar as now_application_guid, 
    nai.now_number,
    m.mine_guid::varchar AS mine_guid,
    p.permit_guid::varchar AS permit_guid,
    'xxx' as bond_guid,
    m.mine_no AS mine_number,
    -- MMSPMT.UPD_NO AS UPDATE_NUMBER Not sure if we have an equivalent?
    'xxx' AS notice_of_work_type_code,
    'xxx' AS notice_of_work_type_description,
    'access presently gated' as access_presently_gated,
    'key provided to the inspector' as key_provided_to_inspector,
    'xxx' as property_name,
    m.mine_region,
    'xxx' as mine_region_description,
    p.permit_no,
    m.mine_name,
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS mine_tenure_code,
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS mine_tenure_description,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS mine_commodity_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS mine_commodity_description,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS mine_disturbance_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS mine_disturbance_description,
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_d,
    mosr.description AS mine_operation_status_reason_d,
    mossr.description AS mine_operation_status_sub_reason_d,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    na.now_application_status_code as now_application_status_code,
    nas.description as now_application_status_description,
    'xxx' as now_application_progress, -- I think this will have to be a single string of all status codes and whether or not they are started or complete?
    'xxx' as now_application_submitted_date,
    'xxx' as permit_type_code,
    'xxx' as permit_status_code,
    'xxx' as permit_status_code_description,
    min(pa.issue_date) AS permit_issue_date,
    'xxx' as permit_authorization_end_date, -- not sure this makes sense
    'xxx' as bond_amount,
    'xxx' as bond_status_code,
    'xxx' as bond_status_code_description,
    m.latitude::varchar AS mine_latitude,
    m.longitude::varchar AS mine_longitude,
    na.type_of_application,
    na.is_applicant_individual_or_company::varchar AS is_applicant_individual_or_company,
    na.relationship_to_applicant::varchar AS relationship_to_applicant,
    na.description_of_land,
    'xxx' as proposed_start_date,
    'xxx' as proposed_end_date,
    'xxx' as helicopter_access, -- ???
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    pt.party_guid AS permittee_party_guid,
    m.create_timestamp ::varchar AS mine_date,
    ms.effective_date::varchar AS status_date,
    m.major_mine_ind::varchar AS major_mine_ind,
    CASE
        WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
        ELSE 'Regional Mine'::text
    END AS major_mine_d
    FROM now_application_identity nai
    LEFT JOIN mine m on m.mine_guid = nai.mine_guid 
    LEFT JOIN now_application na on nai.now_application_guid = na.now_application_guid
    LEFT JOIN mine_permit_xref mpx on m.mine_guid = mpx.mine_guid 
    LEFT JOIN permit p ON mpx.permit_id = p.permit_id
    LEFT JOIN permit_amendment pa ON pa.permit_id = p.permit_id AND pa.mine_guid = m.mine_guid 
    LEFT JOIN mine_party_appt mpa ON mpx.permit_id = mpa.permit_id AND mpa.end_date IS NULL
    LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
    LEFT JOIN address a ON a.party_guid = pt.party_guid
    LEFT JOIN ( SELECT DISTINCT ON (mine_status.mine_guid) mine_status.mine_guid,
        mine_status.mine_status_xref_guid,
        mine_status.effective_date
        FROM mine_status
        ORDER BY mine_status.mine_guid, mine_status.effective_date DESC) ms ON m.mine_guid = ms.mine_guid
    LEFT JOIN now_application_status nas ON na.now_application_status_code = nas.now_application_status_code
    LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
    LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
    LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
    LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
    LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
    LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
    LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
    LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
    LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::TEXT
  WHERE m.deleted_ind = false
  GROUP BY p.permit_no, p.permit_guid, pa.issue_date, m.mine_guid, m.mine_name, m.mine_no, m.deleted_ind, mos.description, mosr.description, mossr.description, mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, ms.effective_date, pt.first_name, pt.party_name, pt.party_guid;
