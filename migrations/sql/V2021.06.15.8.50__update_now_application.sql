ALTER TABLE state_of_land 
ADD COLUMN IF NOT EXISTS authorization_details varchar,
ADD COLUMN IF NOT EXISTS has_licence_of_occupation boolean;