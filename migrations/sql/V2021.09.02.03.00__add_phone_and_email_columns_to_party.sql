
ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_no_sec character varying(12) NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_sec_ext character varying(4) NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_no_ter character varying(12) NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_ter_ext character varying(4) NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS email_sec character varying(254) NULL;