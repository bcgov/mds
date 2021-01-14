DROP VIEW IF EXISTS notice_of_work_view;
CREATE OR REPLACE VIEW notice_of_work_view
	AS
SELECT nid.now_application_guid,
m.mine_guid,
m.mine_no,
nid.now_number,
app.lead_inspector_party_guid,
concat_ws (' ', p.first_name, p.party_name) AS lead_inspector_name,
COALESCE(nowt.description, sub.noticeofworktype, msub.noticeofworktype) as notice_of_work_type_description,
CASE COALESCE(nows.description, sub.status)
  WHEN 'Under Review' THEN 'Pending Verification'
  ElSE COALESCE(nows.description, sub.status)
END as now_application_status_description,
COALESCE(app.received_date, sub.receiveddate, msub.receiveddate) as received_date,
(CASE
	WHEN nid.now_application_id IS NOT NULL THEN FALSE
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
WHERE sub.originating_system IS NULL 
	OR (sub.originating_system IS NOT NULL AND nid.now_number IS NOT NULL);