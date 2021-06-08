ALTER TABLE settling_pond
ADD COLUMN IF NOT EXISTS sediment_control_structure_description varchar,
ADD COLUMN IF NOT EXISTS decant_structure_description varchar,
ADD COLUMN IF NOT EXISTS water_discharged_description varchar,
ADD COLUMN IF NOT EXISTS spillway_design_description varchar;