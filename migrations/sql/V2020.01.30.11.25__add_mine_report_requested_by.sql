ALTER TABLE mine_report ADD COLUMN created_by_idir varchar;

UPDATE mine_report set created_by_idir = create_user; 

ALTER TABLE mine_report ALTER COLUMN created_by_idir SET NOT NULL;