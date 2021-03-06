DROP VIEW IF EXISTS bond_view;


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