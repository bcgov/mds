UPDATE permit_conditions
SET last_updated_by = update_user,
    last_updated_date = update_timestamp;



ALTER TABLE permit_conditions
    ALTER COLUMN last_updated_by SET NOT NULL,
    ALTER COLUMN last_updated_date SET NOT NULL;