ALTER TABLE
    project_summary_authorization
ADD
    COLUMN IF NOT EXISTS ams_tracking_number varchar(20),
ADD
    COLUMN IF NOT EXISTS ams_outcome varchar(4000),
ADD
    COLUMN IF NOT EXISTS ams_submission_timestamp timestamp with time zone;