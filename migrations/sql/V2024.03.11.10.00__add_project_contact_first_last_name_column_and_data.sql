ALTER TABLE project_contact
    ADD COLUMN IF NOT EXISTS first_name varchar(200),
    ADD COLUMN IF NOT EXISTS last_name varchar(200);

UPDATE project_contact 
    SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = substring(name,(length(split_part(name,' ',1)))+2,(length(name)) - (length(split_part(name,' ',1))));

ALTER TABLE project_contact
    DROP COLUMN IF EXISTS name;