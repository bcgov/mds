ALTER TABLE bond_history ADD COLUMN IF NOT EXISTS permit_mine_guid uuid;

-- Assume that all permits belonged to the currently associated mine.
UPDATE bond_history SET permit_mine_guid = p.mine_guid FROM bond_history bh, permit p WHERE bh.permit_guid = p.permit_guid;

ALTER TABLE bond_history ALTER COLUMN permit_mine_guid SET NOT NULL;
