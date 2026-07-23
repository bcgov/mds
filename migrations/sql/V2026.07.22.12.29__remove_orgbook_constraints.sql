ALTER TABLE party_orgbook_entity
ALTER COLUMN name_id
DROP NOT NULL,
ALTER COLUMN credential_id
DROP NOT NULL,
ALTER COLUMN company_alias
DROP NOT NULL,
ALTER COLUMN registration_date
DROP NOT NULL,
ALTER COLUMN registration_status
DROP NOT NULL,
ADD COLUMN data_source character varying(60) NOT NULL default 'ORGBOOK';

ALTER TABLE party_orgbook_entity
ALTER COLUMN data_source
DROP DEFAULT;