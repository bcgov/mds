-- OPTIONAL:  This script is used to erase all the existing data in MDS
DROP TABLE IF EXISTS etl_mine, etl_manager, etl_permit, etl_status, etl_location;
Truncate party cascade;
Truncate mine cascade;
Truncate mine_status_xref cascade;

