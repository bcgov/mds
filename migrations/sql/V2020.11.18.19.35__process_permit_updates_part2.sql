
UPDATE permit set is_exploration = true where permit_no like '%X-%';

drop view bond_view;
drop view mine_summary_view;
ALTER TABLE permit ALTER COLUMN permit_no SET DATA TYPE varchar;


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


CREATE VIEW bond_view AS
SELECT *
FROM
    (SELECT bond.bond_id,
            amount,
            bond.bond_type_code,
            bond_type.description as "bond_type_description",
            bond.bond_status_code,
            bond_status.description as "bond_status_description",
            issue_date,
            note,
            closed_date,
            closed_note,
            payer_party_guid,
            party_name AS "payer_name",
            institution_city,
            institution_name,
            institution_postal_code,
            institution_province,
            institution_street,
            permit_guid,
            permit_no,
            permit.project_id,
            reference_number,
            bond.update_timestamp,
            bond.update_user,
            'Yes' AS "is_current_record",
            'CORE' as "source"
     FROM bond,
          party,
          permit,
          bond_permit_xref,
          bond_type,
          bond_status
     WHERE bond.payer_party_guid = party.party_guid
         AND permit.permit_id = bond_permit_xref.permit_id
         AND bond.bond_id = bond_permit_xref.bond_id
         AND bond.bond_type_code = bond_type.bond_type_code
         AND bond.bond_status_code = bond_status.bond_status_code --HISTORY VALUES

     UNION ALL SELECT bond_history.bond_id,
                      amount,
                      bond_history.bond_type_code,
                      bond_type.description as "bond_type_description",
                      bond_history.bond_status_code,
                      bond_status.description as "bond_status_description",
                      issue_date,
                      note,
                      closed_date,
                      closed_note,
                      payer_party_guid,
                      payer_name,
                      institution_city,
                      institution_name,
                      institution_postal_code,
                      institution_province,
                      institution_street,
                      permit.permit_guid,
                      permit.permit_no,
                      permit.project_id,
                      reference_number,
                      bond_history.update_timestamp,
                      bond_history.update_user,
                      'No' AS "is_current_record",
                      'CORE_HIST' as "source"
     FROM bond_history,
          bond_type,
          bond_status,
          permit,
          bond_permit_xref
     WHERE bond_history.bond_type_code = bond_type.bond_type_code
         AND bond_history.bond_status_code = bond_status.bond_status_code
         AND permit.permit_id = bond_permit_xref.permit_id
         AND bond_history.bond_id = bond_permit_xref.bond_id -- SES RECORDS that couldn't be imported
 
     UNION SELECT NULL, 
                  sec_amt, 
                  bond_type_code, 
                  null, 
                  bond_status_code, 
                  null, 
                  cnt_dt, 
                  "comment", 
                  CASE WHEN bond_type_code IN ('REL', 'CON') THEN cnt_dt ELSE null END as "closed_date", 
                  null, 
                  null::uuid, 
                  cmp_nm, 
                  institution_city, 
                  institution_name, 
                  institution_province, 
                  institution_street, 
                  institution_postal_code, 
                  null, 
                  permit_no, 
                  project_no, 
                  reference_number, 
                  null as "update_timestamp", 
                  null as "update_user", 
                  'Yes' AS "is_current_record", 
                  'MMS_FDW' as "source"
     FROM SES_BOND_STAGING
	 
     UNION SELECT NULL, 
                  sec_amt, 
                  bond_type_code, 
                  null, 
                  'ACT' as "bond_status_code", 
                  null, 
                  cnt_dt, 
                  "comment", 
                  null, 
                  null, 
                  null::uuid, 
                  cmp_nm, 
                  institution_city, 
                  institution_name, 
                  institution_province, 
                  institution_street, 
                  institution_postal_code, 
                  null, 
                  permit_no, 
                  project_no, 
                  reference_number, 
                  null as "update_timestamp", 
                  null as "update_user", 
                  'No' AS "is_current_record", 
                  'MMS_FDW_HIST' as "source"
     FROM SES_BOND_STAGING
	 WHERE bond_status_code IN ('REL','CON')) AS bond_data
	 
ORDER BY bond_id,
         is_current_record DESC;