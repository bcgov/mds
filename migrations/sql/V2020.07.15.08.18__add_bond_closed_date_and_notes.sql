ALTER TABLE bond ADD COLUMN IF NOT EXISTS closed_date timestamp;
ALTER TABLE bond ADD COLUMN IF NOT EXISTS closed_note varchar;

ALTER TABLE bond_history ADD COLUMN IF NOT EXISTS closed_date timestamp;
ALTER TABLE bond_history ADD COLUMN IF NOT EXISTS closed_note varchar;

UPDATE bond SET closed_date = update_timestamp WHERE closed_date IS NULL AND bond_status_code in ('REL', 'CON');
UPDATE bond_history SET closed_date =
    (SELECT MIN(update_timestamp) FROM bond_history bh2 WHERE bh2.bond_history_id = bond_history.bond_history_id AND bh2.bond_status_code IN ('REL', 'CON'))
WHERE closed_date IS NULL AND bond_status_code in ('REL', 'CON');