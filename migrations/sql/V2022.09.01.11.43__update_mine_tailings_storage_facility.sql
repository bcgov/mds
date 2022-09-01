CREATE TYPE storage_location AS ENUM ('above_ground', 'below_ground');
CREATE TYPE facility_type AS ENUM ('tailings_storage_facility');
CREATE TYPE tailings_storage_facility_type AS ENUM ('conventional', 'dry_stacking', 'pit', 'lake', 'other');

ALTER TABLE
    mine_tailings_storage_facility
ADD COLUMN storage_location storage_location,
ADD COLUMN facility_type facility_type,
ADD COLUMN tailings_storage_facility_type tailings_storage_facility_type,
ADD COLUMN mines_act_permit_no character varying(100);