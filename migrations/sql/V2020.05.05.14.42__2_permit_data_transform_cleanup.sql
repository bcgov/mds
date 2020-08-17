
--delete multiplicity (a mine can't have a permit more than once)
delete 
from 
	mine_permit_xref mpx
		using mine_permit_xref mpx2
where mpx.create_timestamp > mpx2.create_timestamp
and mpx.permit_id = mpx2.permit_id
and mpx.mine_guid = mpx2.mine_guid;
alter table mine_permit_xref add primary key (mine_guid, permit_id); 
--fk's ensure that mine uses that permit, not that both just exist. 
ALTER TABLE permit_amendment ADD CONSTRAINT permit_amendment_mine_permit_xref_mine_guid_permit_no_fk FOREIGN KEY (mine_guid, permit_id) REFERENCES mine_permit_xref(mine_guid,permit_id);
ALTER TABLE mine_report ADD CONSTRAINT mine_report_mine_permit_xref_mine_guid_permit_no_fk FOREIGN KEY (mine_guid, permit_id) REFERENCES mine_permit_xref(mine_guid,permit_id);

ALTER TABLE mine_party_appt DROP COLUMN permit_guid CASCADE;

--update this view to use the new join
CREATE OR REPLACE VIEW public.mine_summary_view
AS SELECT m.mine_guid::character varying AS mine_guid,
    p.permit_guid::character varying AS permit_guid,
    m.mine_name,
    m.mine_no AS mine_number,
    m.latitude::character varying AS mine_latitude,
    m.longitude::character varying AS mine_longitude,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_d,
    mosr.description AS mine_operation_status_reason_d,
    mossr.description AS mine_operation_status_sub_reason_d,
    ms.effective_date::character varying AS status_date,
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS tenure,
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS tenure_type_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS commodity,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS commodity_type_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS disturbance,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS disturbance_type_code,
    m.major_mine_ind::character varying AS major_mine_ind,
    m.mine_region,
    p.permit_no,
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    '' AS bcmi_url,
        CASE
            WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
            ELSE 'Regional Mine'::text
        END AS major_mine_d
   FROM mine m
   	 left join mine_permit_xref mpx on m.mine_guid = mpx.mine_guid 
     LEFT JOIN permit p ON mpx.permit_id = p.permit_id
     LEFT JOIN mine_party_appt mpa ON mpx.permit_id = mpa.permit_id AND mpa.end_date IS NULL
     LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
     LEFT JOIN ( SELECT DISTINCT ON (mine_status.mine_guid) mine_status.mine_guid,
            mine_status.mine_status_xref_guid,
            mine_status.effective_date
           FROM mine_status
          ORDER BY mine_status.mine_guid, mine_status.effective_date DESC) ms ON m.mine_guid = ms.mine_guid
     LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
     LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
     LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
     LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
     LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
     LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
     LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
     LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
     LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::text
  WHERE m.deleted_ind = false
  GROUP BY p.permit_no, p.permit_guid, m.mine_guid, m.mine_name, m.mine_no, m.deleted_ind, mos.description, mosr.description, mossr.description, mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, ms.effective_date, pt.first_name, pt.party_name;
