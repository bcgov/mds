ALTER TABLE document_manager ADD COLUMN upload_completed_date timestamp with time zone;
ALTER TABLE document_manager RENAME COLUMN upload_date TO upload_started_date;