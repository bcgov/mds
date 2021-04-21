ALTER TABLE mine_document RENAME COLUMN active_ind TO deleted_ind;

UPDATE mine_document SET deleted_ind = NOT deleted_ind;
ALTER TABLE mine_document ALTER COLUMN deleted_ind SET DEFAULT FALSE;