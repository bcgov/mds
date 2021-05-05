DROP VIEW IF EXISTS public.mine_summary_view;

CREATE OR REPLACE VIEW public.mine_summary_view AS (
SELECT
    m.mine_guid::text AS mine_guid,
    p.permit_guid::text AS permit_guid,
    p.permit_id AS permit_id,
    m.mine_name AS mine_name,
    m.mine_no AS mine_number,
    m.latitude::text AS mine_latitude,
    m.longitude::text AS mine_longitude,
    m.government_agency_type_code AS government_agency_type_code,
    gat.description AS government_agency_type_d,
    m.exemption_fee_status_note AS mine_exemption_fee_status_note,
    efs.exemption_fee_status_code AS mine_exemption_fee_status_code,
    efs.description AS mine_exemption_fee_status_d,
    
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    mos.mine_operation_status_code AS mine_operation_status_code,
    mosr.mine_operation_status_reason_code AS mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code as mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_d,
    mosr.description AS mine_operation_status_reason_d,
    mossr.description AS mine_operation_status_sub_reason_d,
    m.create_timestamp::text AS mine_date,
    ms.effective_date::text AS status_date,
    
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS mine_tenure,
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS mine_tenure_type_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS mine_commodity,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS mine_commodity_type_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS mine_disturbance,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS mine_disturbance_type_code,
    
    array_to_string(array_agg(DISTINCT mttc2.description), ','::text) AS permit_tenure,
    array_to_string(array_agg(DISTINCT mttc2.mine_tenure_type_code), ','::text) AS permit_tenure_type_code,
    array_to_string(array_agg(DISTINCT mcc2.description), ','::text) AS permit_commodity,
    array_to_string(array_agg(DISTINCT mcc2.mine_commodity_code), ','::text) AS permit_commodity_type_code,
    array_to_string(array_agg(DISTINCT mdc2.description), ','::text) AS permit_disturbance,
    array_to_string(array_agg(DISTINCT mdc2.mine_disturbance_code), ','::text) AS permit_disturbance_type_code,
    
    m.mine_region AS mine_region,
    m.major_mine_ind::text AS major_mine_ind,
    '' AS bcmi_url,
    CASE
        WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
        ELSE 'Regional Mine'::text
    END AS major_mine_d,
    
    p.permit_no AS permit_no,
    p.permit_status_code AS permit_status_code,
    p.status_changed_timestamp AS permit_status_changed_timestamp,
    min(pa.issue_date) AS issue_date,
    efs2.exemption_fee_status_code AS permit_exemption_fee_status_code,
    efs2.description AS permit_exemption_fee_status_d,
    p.exemption_fee_status_note AS permit_exemption_fee_status_note,
    
    pt.party_guid AS permittee_party_guid,
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    
    a.suite_no AS permittee_address_suite,
    a.address_line_1 AS permittee_address_line_1,
    a.address_line_2 AS permittee_address_line_2,
    a.city AS permittee_address_city,
    a.post_code AS permittee_address_post_code,
    a.sub_division_code AS permittee_address_prov
    
	FROM mine m
	LEFT JOIN mine_permit_xref mpx ON m.mine_guid = mpx.mine_guid 
	LEFT JOIN permit p ON mpx.permit_id = p.permit_id
	LEFT JOIN permit_amendment pa ON pa.permit_id = p.permit_id AND pa.mine_guid = m.mine_guid 
	LEFT JOIN mine_party_appt mpa ON mpx.permit_id = mpa.permit_id AND mpa.mine_party_appt_id = (SELECT mpa2.mine_party_appt_id FROM mine_party_appt mpa2 WHERE mpx.permit_id = mpa2.permit_id AND mpa2.mine_party_appt_type_code = 'PMT' ORDER BY mpa2.end_date DESC NULLS FIRST LIMIT 1)
	LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
	LEFT JOIN address a ON a.party_guid = pt.party_guid
	LEFT JOIN government_agency_type gat ON gat.government_agency_type_code::text = m.government_agency_type_code::text
	
	-- Mine operating status
	LEFT JOIN (
		SELECT
			DISTINCT ON (mine_status.mine_guid) mine_status.mine_guid,
			mine_status.mine_status_xref_guid,
			mine_status.effective_date
		FROM
			mine_status
		ORDER BY
			mine_status.mine_guid,
			mine_status.effective_date DESC
	) ms ON m.mine_guid = ms.mine_guid
	LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
	LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
	LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
	LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
	
	-- Mine site properties
	LEFT JOIN mine_type mt ON mt.permit_guid IS NULL AND m.mine_guid = mt.mine_guid AND mt.active_ind = true
	LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
	LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
	LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
	LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::text
	
	-- Permit site properties
	LEFT JOIN mine_type mt2 ON m.mine_guid = mt2.mine_guid AND mt2.permit_guid = p.permit_guid AND mt2.active_ind = true
	LEFT JOIN mine_tenure_type_code mttc2 ON mt2.mine_tenure_type_code::text = mttc2.mine_tenure_type_code::text
	LEFT JOIN mine_type_detail_xref mtdx2 ON mt2.mine_type_guid = mtdx2.mine_type_guid AND mtdx2.active_ind = true
	LEFT JOIN mine_disturbance_code mdc2 ON mtdx2.mine_disturbance_code::text = mdc2.mine_disturbance_code::text
	LEFT JOIN mine_commodity_code mcc2 ON mtdx2.mine_commodity_code::text = mcc2.mine_commodity_code::text

	-- Mine exemption fee status
	LEFT JOIN exemption_fee_status efs ON m.exemption_fee_status_code = efs.exemption_fee_status_code
	
	-- Permit exemption fee status
	LEFT JOIN exemption_fee_status efs2 ON p.exemption_fee_status_code = efs2.exemption_fee_status_code
    
	WHERE m.deleted_ind = false

	GROUP BY
		p.permit_no,
		p.permit_guid,
		p.permit_id,
		pa.permit_id,
		p.permit_status_code,
		p.status_changed_timestamp,
		efs2.exemption_fee_status_code,
		efs2.description,		
		m.mine_guid,
		m.mine_name,
		m.mine_no,
		m.deleted_ind,
		m.exemption_fee_status_note,
		m.government_agency_type_code,
		gat.description,
		efs.exemption_fee_status_code,
		efs.description,
		p.exemption_fee_status_note,
		mos.description,
		mosr.description,
		mossr.description,
		mos.mine_operation_status_code,
		mosr.mine_operation_status_reason_code,
		mossr.mine_operation_status_sub_reason_code,
		ms.effective_date,
		pt.first_name,
		pt.party_name,
		pt.party_guid,
		a.suite_no,
		a.address_line_1,
		a.address_line_2,
		a.city,
		a.post_code,
		a.sub_division_code
	ORDER BY
		p.permit_id
);
