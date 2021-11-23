ALTER TABLE now_application 
ADD COLUMN IF NOT EXISTS verified_by_user_date timestamp with time zone;

UPDATE now_application SET verified_by_user_date = create_timestamp;

ALTER TABLE now_application 
ADD COLUMN IF NOT EXISTS decision_by_user_date timestamp with time zone;

UPDATE now_application SET decision_by_user_date = status_updated_date;