ALTER TABLE mine_detail DROP CONSTRAINT mine_detail_mine_region_fkey;

DROP VIEW IF EXISTS mine_map_view;
DROP TABLE mine_detail;