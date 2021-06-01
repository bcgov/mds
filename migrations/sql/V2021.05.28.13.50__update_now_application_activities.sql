ALTER TABLE underground_exploration 
ADD COLUMN IF NOT EXISTS proposed_bulk_sample boolean,
ADD COLUMN IF NOT EXISTS proposed_de_watering boolean,
ADD COLUMN IF NOT EXISTS proposed_diamond_drilling boolean,
ADD COLUMN IF NOT EXISTS proposed_mapping_chip_sampling boolean,
ADD COLUMN IF NOT EXISTS proposed_new_development boolean,
ADD COLUMN IF NOT EXISTS proposed_rehab boolean,
ADD COLUMN IF NOT EXISTS proposed_underground_fuel_storage boolean,
ADD COLUMN IF NOT EXISTS surface_total_ore_amount numeric,
ADD COLUMN IF NOT EXISTS surface_total_waste_amount numeric,
ADD COLUMN IF NOT EXISTS surface_total_ore_unit_type_code varchar,
ADD COLUMN IF NOT EXISTS surface_total_waste_unit_type_code varchar;

ALTER TABLE blasting_operation 
ADD COLUMN IF NOT EXISTS show_access_roads boolean,
ADD COLUMN IF NOT EXISTS show_camps boolean,
ADD COLUMN IF NOT EXISTS show_surface_drilling boolean,
ADD COLUMN IF NOT EXISTS show_mech_trench boolean,
ADD COLUMN IF NOT EXISTS show_seismic boolean,
ADD COLUMN IF NOT EXISTS show_bulk boolean,
ADD COLUMN IF NOT EXISTS show_sand_gravel_quarry boolean,
ADD COLUMN IF NOT EXISTS show_underground_exploration boolean;

ALTER TABLE underground_exploration
ADD CONSTRAINT surface_total_ore_unit_type_code_fkey
    FOREIGN KEY (surface_total_ore_unit_type_code)
    REFERENCES  unit_type(unit_type_code),
ADD CONSTRAINT surface_total_waste_unit_type_code_fkey
    FOREIGN KEY (surface_total_waste_unit_type_code)
    REFERENCES  unit_type(unit_type_code);

ALTER TABLE now_submissions.application
ADD COLUMN IF NOT EXISTS underexpbulksample boolean,
ADD COLUMN IF NOT EXISTS underexpdewatering boolean,
ADD COLUMN IF NOT EXISTS underexpdimonddrill boolean,
ADD COLUMN IF NOT EXISTS underexpmappingchip boolean,
ADD COLUMN IF NOT EXISTS underexpnewdev boolean,
ADD COLUMN IF NOT EXISTS underexprehab boolean,
ADD COLUMN IF NOT EXISTS underexpfuelstorage boolean,
ADD COLUMN IF NOT EXISTS underexpsurftotalore numeric,
ADD COLUMN IF NOT EXISTS underexpsurftotalwaste numeric,
ADD COLUMN IF NOT EXISTS underexpsurftotaloreunits varchar,
ADD COLUMN IF NOT EXISTS underexpsurftotalwasteunits varchar;