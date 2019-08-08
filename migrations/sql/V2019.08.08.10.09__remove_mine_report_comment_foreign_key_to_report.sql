
ALTER TABLE mine_report_comment DROP CONSTRAINT mine_report_comment_mine_report_id_fkey;
ALTER TABLE mine_report_comment DROP COLUMN mine_report_id;
ALTER TABLE mine_report_comment ALTER COLUMN mine_report_submission_id SET NOT NULL;
ALTER TABLE mine_report_comment ADD COLUMN deleted_ind boolean DEFAULT false NOT NULL,
