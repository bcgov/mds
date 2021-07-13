ALTER TABLE state_of_land 
ADD COLUMN IF NOT EXISTS authorization_details varchar,
ADD COLUMN IF NOT EXISTS has_licence_of_occupation boolean,
ADD COLUMN IF NOT EXISTS licence_of_occupation varchar,
ADD COLUMN IF NOT EXISTS file_number_of_app varchar,
ADD COLUMN IF NOT EXISTS applied_for_licence_of_occupation boolean,
ADD COLUMN IF NOT EXISTS notice_served_to_private boolean;

ALTER TABLE now_application DROP COLUMN file_number_of_app;