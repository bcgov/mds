ALTER TABLE dam
ALTER COLUMN permitted_dam_crest_elevation TYPE numeric(12, 2),
ALTER COLUMN current_dam_height TYPE numeric(12, 2),
ALTER COLUMN current_elevation TYPE numeric(12, 2),
ALTER COLUMN max_pond_elevation TYPE numeric(12, 2),
ALTER COLUMN min_freeboard_required TYPE numeric(12, 2);

INSERT INTO consequence_classification_status (consequence_classification_status_code, description, active_ind, create_user, create_timestamp, update_user, update_timestamp, display_order)
VALUES ('NRT', 'Not Rated', 'Y', 'system-mds', now(), 'system-mds', now(), 55);