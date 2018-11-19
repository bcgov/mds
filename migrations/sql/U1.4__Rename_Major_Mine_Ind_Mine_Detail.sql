ALTER TABLE mine_detail
RENAME COLUMN major_mine_ind TO major;

ALTER TABLE mine_detail
ALTER COLUMN major DROP NOT NULL;
