ALTER TABLE mine_document ADD COLUMN IF NOT EXISTS upload_date timestamp with time zone; 

update mine_document set upload_date = create_timestamp where upload_date is null;
