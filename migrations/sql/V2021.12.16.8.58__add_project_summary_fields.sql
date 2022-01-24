ALTER TABLE project_summary 
ADD COLUMN IF NOT EXISTS project_summary_title varchar(300) NOT NULL,
ADD COLUMN IF NOT EXISTS proponent_project_id varchar(20),
ADD COLUMN IF NOT EXISTS expected_draft_irt_submission_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_permit_application_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_permit_receipt_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_project_start_date timestamptz,
ALTER COLUMN project_summary_description TYPE varchar(4000);

/* Drop foreign key constraint on project_summary.status_code before inserting/updating existing status codes */
ALTER TABLE project_summary DROP CONSTRAINT status_code_fkey;

/* Add/update project_summary_status codes */
INSERT INTO project_summary_status_code(project_summary_status_code, description, display_order, active_ind, create_user, update_user)
VALUES('DFT', 'Draft', 40, true, 'system-mds', 'system-mds');

UPDATE project_summary_status_code SET project_summary_status_code = 'OPN' WHERE project_summary_status_code = 'O';
UPDATE project_summary_status_code SET project_summary_status_code = 'CLD' WHERE project_summary_status_code = 'C';
UPDATE project_summary_status_code SET project_summary_status_code = 'WDN' WHERE project_summary_status_code = 'W';

/* Update project_summary.status_code to new values */
UPDATE project_summary SET status_code = 'OPN' WHERE status_code = 'O';
UPDATE project_summary SET status_code = 'CLD' WHERE status_code = 'C';
UPDATE project_summary SET status_code = 'WDN' WHERE status_code = 'W';

/* Add foreign key constraint on project_summary.status_code */
ALTER TABLE project_summary ADD CONSTRAINT status_code_fkey FOREIGN KEY (status_code) REFERENCES project_summary_status_code(project_summary_status_code) DEFERRABLE INITIALLY DEFERRED;
