ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_no_sec varchar NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_sec_ext varchar NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_no_ter varchar NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS phone_ter_ext varchar NULL;

ALTER TABLE party ADD COLUMN IF NOT EXISTS email_sec varchar NULL;