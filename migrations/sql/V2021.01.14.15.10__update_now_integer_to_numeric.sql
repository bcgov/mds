ALTER TABLE activity_detail
ALTER COLUMN length TYPE numeric(14,2),
ALTER COLUMN width TYPE numeric(14,2),
ALTER COLUMN depth TYPE numeric(14,2),
ALTER COLUMN height TYPE numeric(14,2),
ALTER COLUMN quantity TYPE numeric(14,2),
ALTER COLUMN water_quantity TYPE numeric(14,2),
ALTER COLUMN cut_line_length TYPE numeric(14,2);

ALTER TABLE camp
ALTER COLUMN volume_fuel_stored TYPE numeric(14,2);

ALTER TABLE sand_gravel_quarry_operation
ALTER COLUMN total_mineable_reserves TYPE numeric(14,2),
ALTER COLUMN total_annual_extraction TYPE numeric(14,2),
ALTER COLUMN nearest_residence_distance TYPE numeric(14,2),
ALTER COLUMN nearest_water_source_distance TYPE numeric(14,2);

ALTER TABLE underground_exploration
ALTER COLUMN total_ore_amount TYPE numeric(14,2),
ALTER COLUMN total_waste_amount TYPE numeric(14,2);

ALTER TABLE now_application
ALTER COLUMN proposed_annual_maximum_tonnage TYPE numeric(14,2),
ALTER COLUMN adjusted_annual_maximum_tonnage TYPE numeric(14,2);
