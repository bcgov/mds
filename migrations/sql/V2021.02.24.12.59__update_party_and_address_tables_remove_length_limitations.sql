DROP VIEW IF EXISTS mine_summary_view;
DROP VIEW IF EXISTS notice_of_work_view;
DROP VIEW IF EXISTS bond_view;

ALTER TABLE party ALTER COLUMN first_name TYPE varchar USING first_name::varchar,
ALTER COLUMN party_name TYPE varchar USING party_name::varchar,
ALTER COLUMN phone_no TYPE varchar USING phone_no::varchar,
ALTER COLUMN email TYPE varchar USING email::varchar,
ALTER COLUMN phone_ext TYPE varchar USING phone_ext::varchar,
ALTER COLUMN create_user TYPE varchar USING create_user::varchar,
ALTER COLUMN update_user TYPE varchar USING update_user::varchar,
ALTER COLUMN party_type_code TYPE varchar USING party_type_code::varchar,
ALTER COLUMN job_title TYPE varchar USING job_title::varchar,
ALTER COLUMN deleted_ind TYPE bool USING deleted_ind::bool,
ALTER COLUMN postnominal_letters TYPE varchar USING postnominal_letters::varchar,
ALTER COLUMN idir_username TYPE varchar USING idir_username::varchar,
ALTER COLUMN bc_federal_incorporation_number TYPE varchar USING bc_federal_incorporation_number::varchar,
ALTER COLUMN bc_registration_number TYPE varchar USING bc_registration_number::varchar,
ALTER COLUMN society_number TYPE varchar USING society_number::varchar,
ALTER COLUMN tax_registration_number TYPE varchar USING tax_registration_number::varchar,
ALTER COLUMN fax_number TYPE varchar USING fax_number::varchar;

ALTER TABLE "address" ALTER COLUMN suite_no TYPE varchar USING suite_no::varchar,
ALTER COLUMN address_line_2 TYPE varchar USING address_line_2::varchar,
ALTER COLUMN address_line_1 TYPE varchar USING address_line_1::varchar,
ALTER COLUMN city TYPE varchar USING city::varchar,
ALTER COLUMN sub_division_code TYPE varchar USING sub_division_code::varchar,
ALTER COLUMN post_code TYPE varchar USING post_code::varchar,
ALTER COLUMN address_type_code TYPE varchar USING address_type_code::varchar,
ALTER COLUMN deleted_ind TYPE bool USING deleted_ind::bool,
ALTER COLUMN create_user TYPE varchar USING create_user::varchar,
ALTER COLUMN update_user TYPE varchar USING update_user::varchar;


CREATE OR REPLACE VIEW public.mine_summary_view
AS SELECT m.mine_guid::character varying AS mine_guid,
    p.permit_guid::character varying AS permit_guid,
    m.mine_name,
    m.mine_no AS mine_number,
    m.latitude::character varying AS mine_latitude,
    m.longitude::character varying AS mine_longitude,
    efs.exemption_fee_status_code AS mine_exemption_fee_status_code,
    efs.description AS mine_exemption_fee_status_d,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_d,
    mosr.description AS mine_operation_status_reason_d,
    mossr.description AS mine_operation_status_sub_reason_d,
    m.create_timestamp ::character varying AS mine_date,
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
    min(pa.issue_date) AS issue_date,
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    pt.party_guid AS permittee_party_guid,
    max(a.suite_no) AS permittee_address_suite,
    max(a.address_line_1) AS permittee_address_line_1,
    max(a.address_line_2) AS permittee_address_line_2,
    max(a.city) AS permittee_address_city,
    max(a.post_code) AS permittee_address_post_code,
    max(a.sub_division_code) AS permittee_address_prov,
    '' AS bcmi_url,
        CASE
            WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
            ELSE 'Regional Mine'::text
        END AS major_mine_d
   FROM mine m
   	 left join mine_permit_xref mpx on m.mine_guid = mpx.mine_guid 
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
     LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
     LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
     LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
     LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
     LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
     LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
     LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
     LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
     LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::TEXT
     LEFT JOIN exemption_fee_status efs ON m.exemption_fee_status_code = efs.exemption_fee_status_code
  WHERE m.deleted_ind = false
  GROUP BY p.permit_no, p.permit_guid, pa.issue_date, m.mine_guid, m.mine_name, m.mine_no, m.deleted_ind, efs.exemption_fee_status_code, efs.description, mos.description, mosr.description, mossr.description, mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, ms.effective_date, pt.first_name, pt.party_name, pt.party_guid;

CREATE OR REPLACE VIEW notice_of_work_view
	AS
SELECT nid.now_application_guid,
m.mine_guid,
m.mine_no,
nid.now_number,
app.lead_inspector_party_guid,
concat_ws (' ', p.first_name, p.party_name) AS lead_inspector_name,
COALESCE(nowt.description, sub.noticeofworktype, msub.noticeofworktype) as notice_of_work_type_description,
-- TODO: Map all MMS and vFCBC statuses to their corresponding Core status.
CASE COALESCE(nows.description, msub.status, sub.status)
  WHEN 'Accepted' THEN 'Approved'
  WHEN 'Under Review' THEN 'Pending Verification'
  WHEN 'Rejected-Initial' THEN 'Rejected'
  WHEN 'Withdrawn' THEN 'Rejected'
  ElSE COALESCE(nows.description, msub.status, sub.status)
END as now_application_status_description,
COALESCE(app.received_date, sub.receiveddate, msub.receiveddate, msub.submitteddate) as received_date,
(CASE
	WHEN nid.now_application_id IS NOT NULL THEN FALSE
  WHEN pa.now_application_guid IS NOT NULL THEN TRUE
  WHEN sub.originating_system IS NULL and msub.mms_cid IS NOT NULL AND msub.status NOT IN ('No Permit Required', 'Approved') THEN FALSE
	WHEN sub.originating_system IS NULL AND msub.mms_cid IS NOT NULL THEN TRUE
	WHEN sub.originating_system IS NOT NULL AND nid.now_number IS NULL THEN TRUE
	WHEN pa.now_application_guid IS NULL THEN FALSE
	ELSE TRUE
END) AS is_historic,
(CASE
    WHEN sub.originating_system IS NOT NULL THEN sub.originating_system
    WHEN msub.mms_cid IS NOT NULL THEN 'MMS'
    WHEN nid.now_application_id IS NOT NULL THEN 'Core'
  	WHEN nid.messageid IS NOT NULL THEN 'VFCBC'
    ELSE NULL
END) as originating_system
FROM now_application_identity nid 
JOIN mine m on nid.mine_guid = m.mine_guid
LEFT JOIN now_submissions.application sub on nid.messageid = sub.messageid and sub.processed = 'Y'
LEFT JOIN mms_now_submissions.application msub on nid.mms_cid = msub.mms_cid
LEFT JOIN now_application app on nid.now_application_id=app.now_application_id
LEFT JOIN party p on app.lead_inspector_party_guid=p.party_guid
LEFT JOIN notice_of_work_type nowt on app.notice_of_work_type_code=nowt.notice_of_work_type_code
LEFT JOIN now_application_status nows on app.now_application_status_code=nows.now_application_status_code
LEFT JOIN permit_amendment pa ON nid.now_application_guid = pa.now_application_guid
WHERE ((nid.messageid IS NOT NULL AND sub.processed = 'Y') OR nid.messageid IS NULL)
AND (sub.originating_system IS NULL OR (sub.originating_system IS NOT NULL AND nid.now_number IS NOT NULL));

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