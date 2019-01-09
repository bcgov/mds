ALTER TABLE mine_detail DROP CONSTRAINT mine_detail_mine_region_fkey;

COMMIT;

DROP VIEW IF EXISTS customer_info;
DROP TABLE mine_detail;