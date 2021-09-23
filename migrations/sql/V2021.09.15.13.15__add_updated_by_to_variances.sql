ALTER TABLE variance 
ADD COLUMN IF NOT EXISTS created_by varchar,
ADD COLUMN IF NOT EXISTS created_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS updated_by varchar,
ADD COLUMN IF NOT EXISTS updated_timestamp timestamptz;

UPDATE variance SET created_by = create_user;
UPDATE variance SET created_timestamp = create_timestamp;
UPDATE variance SET updated_by = update_user;
UPDATE variance SET updated_timestamp = update_timestamp;

