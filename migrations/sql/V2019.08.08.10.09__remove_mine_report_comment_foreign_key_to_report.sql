
ALTER TABLE mine_report_comment 
DROP CONSTRAINT mine_report_comment_mine_report_id_fkey,
DROP CONSTRAINT minespace_user_id_and_core_user_id_mutually_exclusive,
DROP COLUMN mine_report_id,
ALTER COLUMN mine_report_submission_id SET NOT NULL,
ADD COLUMN deleted_ind boolean DEFAULT false NOT NULL,
ADD COLUMN comment_user character varying(250) NOT NULL,
ADD COLUMN comment_datetime timestamp with time zone DEFAULT now() NOT NULL;