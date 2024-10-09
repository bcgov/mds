ALTER TABLE
    project_summary
ALTER COLUMN
    zoning_reason TYPE VARCHAR(4000),
ALTER COLUMN
    legal_land_owner_name TYPE VARCHAR(100),
ALTER COLUMN
    legal_land_owner_contact_number TYPE VARCHAR(12),
ALTER COLUMN
    legal_land_owner_email_address TYPE VARCHAR(100),
ALTER COLUMN
    company_alias TYPE VARCHAR(100);

ALTER TABLE
    regions
ALTER COLUMN
    name TYPE VARCHAR(100);