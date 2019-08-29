ALTER TABLE IF EXISTS ETL_STATUS ADD COLUMN IF NOT EXISTS legacy_mms_mine_status character varying(50);

ALTER TABLE IF EXISTS mine ADD COLUMN IF NOT EXISTS legacy_mms_mine_status character varying(50);
COMMENT ON COLUMN mine.legacy_mms_mine_status IS 'Legacy status from MMS to be served to NRIS';
