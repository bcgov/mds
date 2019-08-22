ALTER TABLE mine ADD COLUMN legacy_mms_mine_status character varying(50);

COMMENT ON COLUMN mine.legacy_mms_mine_status IS 'Legacy status from MMS to be served to NRIS';
