ALTER TABLE permit_amendment ADD COLUMN IF NOT EXISTS is_generated_in_core boolean DEFAULT false NOT NULL;

UPDATE permit_amendment SET is_generated_in_core = true WHERE permit_conditions_last_updated_date IS NOT NULL;