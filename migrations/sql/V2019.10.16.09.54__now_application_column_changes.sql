ALTER TABLE water_supply ALTER COLUMN permit_application_id SET NOT NULL;

ALTER TABLE placer_operation ALTER COLUMN is_underground SET DEFAULT 'false';
ALTER TABLE placer_operation ALTER COLUMN is_underground SET NOT NULL;
ALTER TABLE placer_operation ALTER COLUMN is_hand_operation SET DEFAULT 'false';
ALTER TABLE placer_operation ALTER COLUMN is_hand_operation SET NOT NULL;

ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_community_water_shed SET DEFAULT FALSE;
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET NOT NULL; 
ALTER TABLE state_of_land ALTER COLUMN has_archaeology_sites_affected SET DEFAULT FALSE;