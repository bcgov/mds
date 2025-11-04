-- Add new columns to minespace_user table to align with user table structure
ALTER TABLE minespace_user 
ADD COLUMN sub VARCHAR,
ADD COLUMN email VARCHAR,
ADD COLUMN given_name VARCHAR,
ADD COLUMN family_name VARCHAR,
ADD COLUMN display_name VARCHAR,
ADD COLUMN identity_provider VARCHAR,
ADD COLUMN bceid_user_guid VARCHAR,
ADD COLUMN last_logged_in TIMESTAMPTZ,
ADD COLUMN create_user VARCHAR(255),
ADD COLUMN create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN update_user VARCHAR(255),
ADD COLUMN update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE minespace_user 
RENAME COLUMN email_or_username TO bceid_username;

ALTER TABLE minespace_user 
DROP COLUMN IF EXISTS keycloak_guid;

COMMENT ON COLUMN minespace_user.sub IS 'User subject identifier from identity provider';
COMMENT ON COLUMN minespace_user.email IS 'User email address';
COMMENT ON COLUMN minespace_user.given_name IS 'User given/first name';
COMMENT ON COLUMN minespace_user.family_name IS 'User family/last name';
COMMENT ON COLUMN minespace_user.display_name IS 'User display name';
COMMENT ON COLUMN minespace_user.bceid_username IS 'BCeID username (renamed from email_or_username)';
COMMENT ON COLUMN minespace_user.identity_provider IS 'Identity provider used for authentication';
COMMENT ON COLUMN minespace_user.bceid_user_guid IS 'BCeID user GUID';
COMMENT ON COLUMN minespace_user.last_logged_in IS 'Timestamp of last login';
COMMENT ON COLUMN minespace_user.create_user IS 'User who created the record';
COMMENT ON COLUMN minespace_user.create_timestamp IS 'Timestamp when record was created';
COMMENT ON COLUMN minespace_user.update_user IS 'User who last updated the record';
COMMENT ON COLUMN minespace_user.update_timestamp IS 'Timestamp when record was last updated';