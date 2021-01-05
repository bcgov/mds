ALTER TABLE now_application_progress ALTER COLUMN start_date SET DATA TYPE timestamp;
ALTER TABLE now_application_progress ALTER COLUMN end_date SET DATA TYPE timestamp;
ALTER TABLE now_application_delay ALTER COLUMN start_date SET DATA TYPE timestamp;
ALTER TABLE now_application_delay ALTER COLUMN end_date SET DATA TYPE timestamp;