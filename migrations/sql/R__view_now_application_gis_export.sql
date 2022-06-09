CREATE INDEX IF NOT EXISTS idx_activity_summary_now_application_id
ON activity_summary (now_application_id);

CREATE INDEX IF NOT EXISTS idx_now_submissions_application_messageid
ON now_submissions.application (messageid);

CREATE INDEX IF NOT EXISTS idx_mine_mine_guid
ON mine (mine_guid);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_mine_guid
ON now_application_identity (mine_guid);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_now_application_id
ON now_application_identity (now_application_id);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_now_application_guid
ON now_application_identity (now_application_guid);

CREATE INDEX IF NOT EXISTS idx_mms_now_submissions_application_mms_cid
ON mms_now_submissions.application (mms_cid);

CREATE INDEX IF NOT EXISTS idx_mine_status_mine_guid_effective_date
ON mine_status (mine_guid, effective_date DESC);

CREATE INDEX IF NOT EXISTS idx_now_application_identity_mms_cid
ON now_application_identity (mms_cid);
