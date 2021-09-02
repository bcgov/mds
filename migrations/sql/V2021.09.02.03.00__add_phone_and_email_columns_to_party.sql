
ALTER TABLE party ADD COLUMN phone_no_sec character varying(12) NULL;

ALTER TABLE party ADD COLUMN phone_sec_ext character varying(4) NULL;

ALTER TABLE party ADD COLUMN phone_no_ter character varying(12) NULL;

ALTER TABLE party ADD COLUMN phone_ter_ext character varying(4) NULL;

ALTER TABLE party ADD COLUMN email_sec character varying(254) NULL;