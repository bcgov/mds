ALTER TABLE project_summary    
    ADD COLUMN IF NOT EXISTS is_legal_land_owner BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_crown_land_federal_or_provincial BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_landowner_aware_of_discharge_application BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_landowner_received_copy_of_application BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS legal_land_owner_name varchar(200),
    ADD COLUMN IF NOT EXISTS legal_land_owner_contact_number varchar(20),
    ADD COLUMN IF NOT EXISTS legal_land_owner_email_address varchar(200),
    ADD COLUMN IF NOT EXISTS latitude numeric(9, 7),
    ADD COLUMN IF NOT EXISTS longitude numeric(11, 7);
