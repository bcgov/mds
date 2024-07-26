ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS is_historic boolean DEFAULT false NOT NULL;

UPDATE project_summary
SET is_historic = true
WHERE status_code = 'SUB';