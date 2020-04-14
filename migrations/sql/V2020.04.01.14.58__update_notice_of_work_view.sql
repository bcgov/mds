-- Updates the "Notice of Work View" view to fix an issue where the order of NoW coalesce params was incorrect.

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
COALESCE(nows.description, sub.status) as now_application_status_description,
COALESCE(app.received_date, sub.receiveddate, msub.receiveddate) as received_date,
(CASE
    WHEN sub.originating_system IS NOT NULL THEN sub.originating_system
    WHEN msub.mms_cid IS NOT NULL THEN 'MMS'
    WHEN nid.now_application_id IS NOT NULL THEN 'Core'
    ELSE NULL
END) as originating_system
FROM now_application_identity nid 
JOIN mine m on nid.mine_guid = m.mine_guid
LEFT JOIN now_submissions.application sub on nid.messageid = sub.messageid
LEFT JOIN mms_now_submissions.application msub on nid.mms_cid = msub.mms_cid
LEFT JOIN now_application app on nid.now_application_id=app.now_application_id
LEFT JOIN party p on app.lead_inspector_party_guid=p.party_guid
LEFT JOIN notice_of_work_type nowt on app.notice_of_work_type_code=nowt.notice_of_work_type_code
LEFT JOIN now_application_status nows on app.now_application_status_code=nows.now_application_status_code;
