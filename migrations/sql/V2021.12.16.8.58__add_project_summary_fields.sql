ALTER TABLE project_summary 
ADD COLUMN IF NOT EXISTS project_summary_title varchar(300) NOT NULL,
ADD COLUMN IF NOT EXISTS proponent_project_id varchar(20),
ADD COLUMN IF NOT EXISTS expected_draft_irt_submission_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_permit_application_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_permit_receipt_date timestamptz,
ADD COLUMN IF NOT EXISTS expected_project_start_date timestamptz,
ALTER COLUMN project_summary_description TYPE varchar(4000);

INSERT INTO project_summary_status_code(project_summary_status_code, description, display_order, active_ind, create_user, update_user)
VALUES('D', 'Draft', 40, true, 'system-mds', 'system-mds');
