-- Create a column to capture the date the status was updated 
ALTER TABLE now_application ADD COLUMN IF NOT EXISTS status_updated_date DATE DEFAULT NOW() NOT NULL;

-- Set each application's initial "status updated" date to be its submitted date
UPDATE now_application now1 SET status_updated_date = (SELECT submitted_date FROM now_application now2 WHERE now1.now_application_id = now2.now_application_id);
