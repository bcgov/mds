ALTER TABLE party_verifiable_credential_connection ADD COLUMN IF NOT EXISTS last_webhook_timestamp timestamp with time zone;
ALTER TABLE party_verifiable_credential_mines_act_permit ADD COLUMN IF NOT EXISTS last_webhook_timestamp timestamp with time zone;