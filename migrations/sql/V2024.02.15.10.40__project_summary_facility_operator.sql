-- add party for facility operator
ALTER TABLE project_summary
    ADD COLUMN IF NOT EXISTS facility_operator_guid UUID,
    ADD COLUMN IF NOT EXISTS facility_type VARCHAR,
    ADD COLUMN IF NOT EXISTS facility_desc VARCHAR(4000),
    ADD COLUMN IF NOT EXISTS facility_latitude NUMERIC(9,7),
    ADD COLUMN IF NOT EXISTS facility_longitude NUMERIC(11,7),
    ADD COLUMN IF NOT EXISTS facility_coords_source VARCHAR(3),
    ADD COLUMN IF NOT EXISTS facility_coords_source_desc VARCHAR(4000),
    ADD COLUMN IF NOT EXISTS facility_pid_pin_crown_file_no VARCHAR(100),
    ADD COLUMN IF NOT EXISTS legal_land_desc VARCHAR(4000),
    ADD COLUMN IF NOT EXISTS facility_lease_no VARCHAR,
    ADD COLUMN IF NOT EXISTS zoning BOOLEAN,
    ADD COLUMN IF NOT EXISTS zoning_reason VARCHAR,

    ADD CONSTRAINT facility_operator_guid_party_guid_fkey
        FOREIGN KEY (facility_operator_guid) REFERENCES party(party_guid);

INSERT INTO mine_party_appt_type_code (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
    )
VALUES
    ('FOP', 'Facility Operator', 280, 'system-mds', 'system-mds', 'true', 'false', 1);