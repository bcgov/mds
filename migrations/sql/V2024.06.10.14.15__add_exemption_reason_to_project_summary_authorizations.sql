ALTER TABLE project_summary_authorization
    ADD COLUMN IF NOT EXISTS exemption_reason varchar(4000);