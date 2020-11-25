ALTER TABLE permit_conditions
ADD COLUMN IF NOT EXISTS last_updated_by varchar(60),
ADD COLUMN IF NOT EXISTS last_updated_date timestamptz;