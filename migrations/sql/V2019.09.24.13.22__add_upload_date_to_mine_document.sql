ALTER TABLE mine_document ADD COLUMN upload_date date; 

update mine_document set upload_date = create_timestamp where upload_date=null;

ALTER TABLE mine_document ALTER COLUMN upload_date SET NOT NULL;
