
ALTER TABLE party ADD COLUMN phone_no_sec IF NOT EXISTS character varying(12) NULL;

ALTER TABLE party ADD COLUMN phone_sec_ext IF NOT EXISTS character varying(4) NULL;

ALTER TABLE party ADD COLUMN phone_no_ter IF NOT EXISTS character varying(12) NULL;

ALTER TABLE party ADD COLUMN phone_ter_ext IF NOT EXISTS character varying(4) NULL;

ALTER TABLE party ADD COLUMN email_sec IF NOT EXISTS character varying(254) NULL;