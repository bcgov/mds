ALTER TABLE mine_detail
  DROP CONSTRAINT mine_detail_mine_type_guid_fkey,
  DROP mine_type_guid
;

DROP TABLE IF EXISTS mine_type;
DROP TABLE IF EXISTS mine_tenure_type;
