CREATE OR REPLACE VIEW notice_of_work_view
	AS
SELECT nid.now_application_guid,
nid.mine_guid, 
m.mine_no,
sub.trackingnumber as tracking_number,
COALESCE(msub.noticeofworktype, sub.noticeofworktype, nowt.description) as notice_of_work_type_description,
COALESCE(sub.status, nows.description) as now_application_status_description,
COALESCE(msub.receiveddate, sub.receiveddate, app.received_date) as received_date
FROM now_application_identity nid 
JOIN mine m on nid.mine_guid = m.mine_guid
LEFT JOIN now_submissions.application sub on nid.messageid = sub.messageid
LEFT JOIN mms_now_submissions.application msub on nid.mms_cid = msub.mms_cid
LEFT JOIN now_application app on nid.now_application_id=app.now_application_id
LEFT JOIN notice_of_work_type nowt on app.notice_of_work_type_code=nowt.notice_of_work_type_code
LEFT JOIN now_application_status nows on app.now_application_status_code=nows.now_application_status_code;