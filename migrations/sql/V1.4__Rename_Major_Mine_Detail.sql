ALTER TABLE mine_detail
RENAME COLUMN major TO major_mine_ind;

ALTER TABLE mine_detail
ALTER COLUMN major_mine_ind SET NOT NULL;
