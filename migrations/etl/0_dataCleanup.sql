-- OPTIONAL:  This script is used to erase all the existing data in MDS 
DROP TABLE IF EXISTS etl_profile, etl_manager, etl_permit;
Truncate party cascade;
Truncate mine_identity cascade;

