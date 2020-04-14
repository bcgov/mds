-- Update the length of all "phone extension" values to 6 (previous value was 4)
ALTER TABLE mine_incident ALTER COLUMN reported_by_phone_ext TYPE CHARACTER VARYING(6);
ALTER TABLE party ALTER COLUMN phone_ext TYPE CHARACTER VARYING(6);