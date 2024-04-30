ALTER TABLE party_verifiable_credential_mines_act_permit ADD COLUMN IF NOT EXISTS cred_type varchar(200);
ALTER TABLE party_verifiable_credential_mines_act_permit ADD COLUMN IF NOT EXISTS error_description varchar(200);
 