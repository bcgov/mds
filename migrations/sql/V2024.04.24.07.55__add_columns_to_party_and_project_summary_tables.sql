ALTER TABLE
    party
ADD
    COLUMN IF NOT EXISTS credential_id integer;

ALTER TABLE
    project_summary
ADD
    COLUMN IF NOT EXISTS company_alias VARCHAR(200) NULL;