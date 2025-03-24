ALTER TABLE dam_version
ALTER COLUMN permitted_dam_crest_elevation TYPE numeric(12, 2),
ALTER COLUMN current_dam_height TYPE numeric(12, 2),
ALTER COLUMN current_elevation TYPE numeric(12, 2),
ALTER COLUMN max_pond_elevation TYPE numeric(12, 2),
ALTER COLUMN min_freeboard_required TYPE numeric(12, 2);