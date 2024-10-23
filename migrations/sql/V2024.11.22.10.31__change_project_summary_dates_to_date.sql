ALTER TABLE project_summary
    ALTER COLUMN expected_draft_irt_submission_date TYPE date
    USING expected_draft_irt_submission_date::date;

ALTER TABLE project_summary
    ALTER COLUMN expected_permit_application_date TYPE date
    USING expected_permit_application_date::date;

ALTER TABLE project_summary
    ALTER COLUMN expected_permit_receipt_date TYPE date
    USING expected_permit_receipt_date::date;

ALTER TABLE project_summary
    ALTER COLUMN expected_project_start_date TYPE date
    USING expected_project_start_date::date;