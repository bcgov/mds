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
            payer_party_guid,
            party_name AS "payer_name",
            institution_city,
            institution_name,
            institution_postal_code,
            institution_province,
            institution_street,
            permit_guid,
            permit_no,
            project_id,
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
         AND bond.bond_status_code = bond_status.bond_status_code
     UNION ALL SELECT bond_id,
                      amount,
                      bond_history.bond_type_code,
                      bond_type.description as "bond_type_description",
                      bond_history.bond_status_code,
                      bond_status.description as "bond_status_description",
                      issue_date,
                      note,
                      payer_party_guid,
                      payer_name,
                      institution_city,
                      institution_name,
                      institution_postal_code,
                      institution_province,
                      institution_street,
                      permit_guid,
                      permit_no,
                      null,
                      reference_number,
                      bond_history.update_timestamp,
                      bond_history.update_user,
                      'No' AS "is_current_record",
                      'CORE_HIST' as "source"
     FROM bond_history,
          bond_type,
          bond_status
     WHERE bond_history.bond_type_code = bond_type.bond_type_code
         AND bond_history.bond_status_code = bond_status.bond_status_code
     UNION SELECT NULL,
                  sec_amt,
                  case
                      when TRIM(sec_typ) = 'Asset Security Agreement' then 'ASA'
                      when TRIM(sec_typ) = 'Cash' then 'CAS'
                      when TRIM(sec_typ) = 'Confiscation' then 'CAS'
                      when TRIM(sec_typ) = 'Letter of Credit' then 'ILC'
                      when TRIM(sec_typ) = 'Qualified Env. Trust' then 'QET'
                      when TRIM(sec_typ) = 'Safekeeping Agreement' then 'SAG'
                      when TRIM(sec_typ) = 'Receipt and Agreement' then 'SAG'
                      when TRIM(sec_typ) = 'Surety Bond' then 'SBO'
                      when TRIM(sec_typ) = 'Recl. Fund' then 'STR'
                      when TRIM(sec_typ) = 'Performance Bond' then 'PFB'
                  end as bond_type_code,
                  TRIM(descript) as "bond_type_description",
                  CASE
                      WHEN "status" = 'E' THEN 'REL'
                      when "status" = 'C' then 'CON'
                      ELSE 'ACT'
                  end as bond_status_code,
                  null,
                  cnt_dt,
                  CONCAT(TRIM(comment1),' ', TRIM(comment2)) as "comment",
                  null::uuid,
                  cmp_nm AS "payer_name",
                  CONCAT(iaddr2,iaddr3) as institution_city,
                  invloc as institution_name,
                  null as institution_province,
                  iaddr1 as institution_street,
                  ipost_cd as institution_postal_code,
                  null,
                  permit_no,
                  project_no,
                  "descript" as reference_number,
                  null as "update_timestamp",
                  null as "update_user",
                  'Yes' AS "is_current_record",
                  'MMS_FDW' as "source"
     FROM mms.secsec
     where sec_cid not in
             (select mms_sec_cid
              from bond
              where mms_sec_cid is not null)
         and sec_cid is not null) as bond_data
ORDER BY bond_id,
         is_current_record DESC;
