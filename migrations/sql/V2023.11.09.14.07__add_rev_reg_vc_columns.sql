ALTER TABLE party_verifiable_credential_mines_act_permit
    ADD COLUMN IF NOT EXISTS rev_reg_id character varying(150); 

ALTER TABLE party_verifiable_credential_mines_act_permit
    ADD COLUMN IF NOT EXISTS cred_rev_id character varying(150); 
