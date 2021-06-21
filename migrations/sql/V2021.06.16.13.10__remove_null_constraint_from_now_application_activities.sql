ALTER TABLE placer_operation
ALTER COLUMN is_hand_operation DROP NOT NULL,
ALTER COLUMN is_hand_operation DROP DEFAULT,
ALTER COLUMN has_stream_diversion DROP NOT NULL,
ALTER COLUMN has_stream_diversion DROP DEFAULT,
ALTER COLUMN is_underground DROP NOT NULL,
ALTER COLUMN is_underground DROP DEFAULT;

ALTER TABLE state_of_land
ALTER COLUMN has_community_water_shed DROP NOT NULL,
ALTER COLUMN has_community_water_shed DROP DEFAULT,
ALTER COLUMN has_archaeology_sites_affected DROP NOT NULL,
ALTER COLUMN has_archaeology_sites_affected DROP DEFAULT;

ALTER TABLE camp
ALTER COLUMN has_fuel_stored DROP NOT NULL,
ALTER COLUMN has_fuel_stored DROP DEFAULT,
ALTER COLUMN has_fuel_stored_in_bulk DROP NOT NULL,
ALTER COLUMN has_fuel_stored_in_bulk DROP DEFAULT,
ALTER COLUMN has_fuel_stored_in_barrels DROP NOT NULL,
ALTER COLUMN has_fuel_stored_in_barrels DROP DEFAULT;

ALTER TABLE settling_pond
ALTER COLUMN is_ponds_exfiltrated DROP NOT NULL,
ALTER COLUMN is_ponds_exfiltrated DROP DEFAULT,
ALTER COLUMN is_ponds_recycled DROP NOT NULL,
ALTER COLUMN is_ponds_recycled DROP DEFAULT,
ALTER COLUMN is_ponds_discharged DROP NOT NULL,
ALTER COLUMN is_ponds_discharged DROP DEFAULT;

ALTER TABLE blasting_operation
ALTER COLUMN has_storage_explosive_on_site DROP NOT NULL,
ALTER COLUMN has_storage_explosive_on_site DROP DEFAULT,
ALTER COLUMN explosive_permit_issued DROP NOT NULL,
ALTER COLUMN explosive_permit_issued DROP DEFAULT;
