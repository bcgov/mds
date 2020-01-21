DROP VIEW mine_summary_view;
CREATE OR REPLACE VIEW mine_summary_view as
SELECT m.mine_guid::varchar, p.permit_guid::varchar, m.mine_name, m.mine_no as mine_number, m.latitude::varchar as mine_latitude, m.longitude::varchar as mine_longitude,
CONCAT(mos.description, ',', mosr.description, ',', mossr.description) as operation_status, 
CONCAT(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) as operation_status_code,
mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, mos.description as mine_operation_status_d,
mosr.description as mine_operation_status_reason_d, mossr.description as mine_operation_status_sub_reason_d,
ms.effective_date::varchar as status_date,
array_to_string(array_agg(DISTINCT mttc.description), ',') as tenure,
array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ',') as tenure_type_code,
array_to_string(array_agg(DISTINCT mcc.description), ',') as commodity,
array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ',') as commodity_type_code,
array_to_string(array_agg(DISTINCT mdc.description), ',') as disturbance,
array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ',') as disturbance_type_code,
m.major_mine_ind::varchar, m.mine_region,
p.permit_no, pt.first_name as permittee_first_name, pt.party_name as permittee_name,
'' as bcmi_url,
CASE
    WHEN m.major_mine_ind is TRUE THEN 'Major Mine'
    ELSE 'Regional Mine'
END AS major_mine_d

FROM mine m
LEFT JOIN permit p on m.mine_guid = p.mine_guid
LEFT JOIN mine_party_appt mpa on p.permit_guid = mpa.permit_guid AND end_date is null
LEFT JOIN party pt on mpa.party_guid = pt.party_guid
LEFT JOIN (SELECT DISTINCT ON (mine_guid) mine_guid, mine_status_xref_guid, effective_date from mine_status ORDER BY mine_guid, effective_date desc) ms on m.mine_guid = ms.mine_guid
LEFT JOIN mine_status_xref msx on ms.mine_status_xref_guid = msx.mine_status_xref_guid
LEFT JOIN mine_operation_status_code mos on msx.mine_operation_status_code = mos.mine_operation_status_code
LEFT JOIN mine_operation_status_reason_code mosr on msx.mine_operation_status_reason_code = mosr.mine_operation_status_reason_code
LEFT JOIN mine_operation_status_sub_reason_code mossr on msx.mine_operation_status_sub_reason_code = mossr.mine_operation_status_sub_reason_code
LEFT JOIN mine_type mt on m.mine_guid=mt.mine_guid AND mt.active_ind=true
LEFT JOIN mine_tenure_type_code mttc on mt.mine_tenure_type_code=mttc.mine_tenure_type_code
LEFT JOIN mine_type_detail_xref mtdx on mt.mine_type_guid = mtdx.mine_type_guid and mtdx.active_ind = true
LEFT JOIN mine_disturbance_code mdc on mtdx.mine_disturbance_code = mdc.mine_disturbance_code
LEFT JOIN mine_commodity_code mcc on mtdx.mine_commodity_code = mcc.mine_commodity_code
where m.deleted_ind = false
GROUP BY p.permit_no, p.permit_guid, m.mine_guid, m.mine_name, m.mine_no, m.deleted_ind,
mos.description, mosr.description, mossr.description, 
mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, 
ms.effective_date,
pt.first_name, pt.party_name;
