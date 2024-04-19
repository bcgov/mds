ALTER TABLE
    now_submissions.application
ADD
    COLUMN IF NOT EXISTS submitted_to_core_date date;

ALTER TABLE
    now_application
ADD
    COLUMN IF NOT EXISTS submitted_to_core_date date;