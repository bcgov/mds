ALTER TABLE permit_amendment
    ADD COLUMN IF NOT EXISTS permit_conditions_last_updated_by varchar(60),
    ADD COLUMN IF NOT EXISTS permit_conditions_last_updated_date timestamptz;