ALTER TABLE water_supply ALTER COLUMN permit_application_id SET NOT NULL;

ALTER TABLE placer_operation ALTER COLUMN is_underground SET DEFAULT 'false';
ALTER TABLE placer_operation ALTER COLUMN is_underground SET NOT NULL;
ALTER TABLE placer_operation ALTER COLUMN is_hand_operation SET DEFAULT 'false';
ALTER TABLE placer_operation ALTER COLUMN is_hand_operation SET NOT NULL;

ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET DEFAULT FALSE;
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET DEFAULT FALSE;

ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET DEFAULT FALSE;
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET DEFAULT FALSE;

ALTER TABLE camp ALTER COLUMN has_fuel_stored SET NOT NULL; 
ALTER TABLE camp ALTER COLUMN has_fuel_stored SET DEFAULT FALSE;
ALTER TABLE camp ALTER COLUMN has_fuel_stored_in_bulk SET NOT NULL; 
ALTER TABLE camp ALTER COLUMN has_fuel_stored_in_bulk SET DEFAULT FALSE;
ALTER TABLE camp ALTER COLUMN has_fuel_stored_in_barrels SET NOT NULL; 
ALTER TABLE camp ALTER COLUMN has_fuel_stored_in_barrels SET DEFAULT FALSE;
ALTER TABLE settling_pond ALTER COLUMN is_ponds_exfiltrated SET NOT NULL; 
ALTER TABLE settling_pond ALTER COLUMN is_ponds_exfiltrated SET DEFAULT FALSE;
ALTER TABLE settling_pond ALTER COLUMN is_ponds_recycled SET NOT NULL; 
ALTER TABLE settling_pond ALTER COLUMN is_ponds_recycled SET DEFAULT FALSE;
ALTER TABLE settling_pond ALTER COLUMN is_ponds_discharged SET NOT NULL; 
ALTER TABLE settling_pond ALTER COLUMN is_ponds_discharged SET DEFAULT FALSE;
ALTER TABLE blasting_operation ALTER COLUMN has_storage_explosive_on_site SET NOT NULL; 
ALTER TABLE blasting_operation ALTER COLUMN has_storage_explosive_on_site SET DEFAULT FALSE;
ALTER TABLE blasting_operation ALTER COLUMN explosive_permit_issued SET NOT NULL; 
ALTER TABLE blasting_operation ALTER COLUMN explosive_permit_issued SET DEFAULT FALSE;