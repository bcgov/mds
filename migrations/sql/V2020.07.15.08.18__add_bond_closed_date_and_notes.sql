ALTER TABLE bond ADD COLUMN IF NOT EXISTS closed_date timestamp;
ALTER TABLE bond ADD COLUMN IF NOT EXISTS closed_note varchar;

ALTER TABLE bond_history ADD COLUMN IF NOT EXISTS closed_date timestamp;
ALTER TABLE bond_history ADD COLUMN IF NOT EXISTS closed_note varchar;

UPDATE bond SET closed_date = update_timestamp WHERE bond_status_code in ('REL', 'CON');
UPDATE bond_history SET closed_date = update_timestamp WHERE bond_status_code in ('REL', 'CON');