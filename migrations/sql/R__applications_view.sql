
DROP VIEW IF EXISTS public.applications_view;

CREATE OR REPLACE VIEW public.applications_view
AS SELECT nid.now_application_guid,
    m.mine_guid,
    m.mine_no,
    nid.now_application_id,
    nid.now_number,
    app.status_reason,
    nid.permit_id,
    app.lead_inspector_party_guid,
    concat_ws(' '::text, p.first_name, p.party_name) AS lead_inspector_name,
    app.issuing_inspector_party_guid,
    concat_ws(' '::text, pis.first_name, pis.party_name) AS issuing_inspector_name,
    nid.application_type_code,
    COALESCE(nowt.description, sub.noticeofworktype, msub.noticeofworktype) AS notice_of_work_type_description,
    atc.description,
        CASE
            WHEN nows.description IS NULL THEN
            CASE COALESCE(msub.status, sub.status)
                WHEN 'Accepted'::text THEN 'Approved'::character varying
                WHEN 'Under Review'::text THEN 'Pending Verification'::character varying
                WHEN 'Referral Complete'::text THEN 'Pending Verification'::character varying
                WHEN 'Referred'::text THEN 'Pending Verification'::character varying
                WHEN 'Client Delayed'::text THEN 'Pending Verification'::character varying
                WHEN 'No Permit Required'::text THEN 'Pending Verification'::character varying
                WHEN 'Govt. Action Required'::text THEN 'Pending Verification'::character varying
                WHEN 'Rejected-Initial'::text THEN 'Rejected'::character varying
                WHEN 'Withdrawn'::text THEN 'Rejected'::character varying
                ELSE COALESCE(msub.status, sub.status)
            END
            ELSE COALESCE(nows.description, msub.status, sub.status)
        END AS now_application_status_description,
   COALESCE(app.received_date, sub.receiveddate, msub.receiveddate, msub.submitteddate) AS received_date,
        CASE
            WHEN nid.now_application_id IS NOT NULL THEN false
            WHEN pa.now_application_guid IS NOT NULL THEN true
            WHEN sub.originating_system IS NULL AND msub.mms_cid IS NOT NULL AND (msub.status::text <> ALL (ARRAY['No Permit Required'::character varying, 'Approved'::character varying]::text[])) THEN false
            WHEN sub.originating_system IS NULL AND msub.mms_cid IS NOT NULL THEN true
            WHEN sub.originating_system IS NOT NULL AND nid.now_number IS NULL THEN true
            WHEN pa.now_application_guid IS NULL THEN false
            ELSE true
        END AS is_historic,
        CASE
            WHEN sub.originating_system IS NOT NULL THEN sub.originating_system
            WHEN msub.mms_cid IS NOT NULL THEN 'MMS'::character varying
            WHEN nid.now_application_id IS NOT NULL THEN 'Core'::character varying
            WHEN nid.messageid IS NOT NULL THEN 'VFCBC'::character varying
            ELSE NULL::character varying
        END AS originating_system,
    app.create_timestamp AS import_timestamp,
    app.update_timestamp,
    nowt.description AS application_type_description,
    app.now_application_status_code,
    app.status_updated_date
   FROM now_application_identity nid
     JOIN mine m ON nid.mine_guid = m.mine_guid
     LEFT JOIN now_submissions.application sub ON nid.messageid = sub.messageid AND sub.processed::text = 'Y'::text
     LEFT JOIN mms_now_submissions.application msub ON nid.mms_cid = msub.mms_cid
     LEFT JOIN now_application app ON nid.now_application_id = app.now_application_id
     LEFT JOIN party p ON app.lead_inspector_party_guid = p.party_guid
     LEFT JOIN notice_of_work_type nowt ON app.notice_of_work_type_code::text = nowt.notice_of_work_type_code::text
     LEFT JOIN now_application_status nows ON app.now_application_status_code::text = nows.now_application_status_code::text
     LEFT JOIN permit_amendment pa ON nid.now_application_guid = pa.now_application_guid
     LEFT JOIN application_type_code atc ON atc.application_type_code::text = nid.application_type_code::text
     LEFT JOIN party pis ON app.issuing_inspector_party_guid = pis.party_guid
     WHERE (nid.messageid IS NOT NULL AND sub.processed::text = 'Y'::text OR nid.messageid IS NULL) AND (sub.originating_system IS NULL OR sub.originating_system IS NOT NULL AND nid.now_number IS NOT NULL);
     ;