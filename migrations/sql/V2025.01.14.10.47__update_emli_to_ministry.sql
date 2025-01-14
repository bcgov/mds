ALTER TABLE mine_report_notification 
    DROP CONSTRAINT mine_report_notification_contact_guid_fkey;

ALTER TABLE emli_contact 
    RENAME TO ministry_contact;
ALTER TABLE ministry_contact 
    RENAME COLUMN emli_contact_type_code to ministry_contact_type_code;

ALTER TABLE emli_contact_type 
    RENAME TO ministry_contact_type;
ALTER TABLE ministry_contact_type 
    RENAME COLUMN emli_contact_type_code to ministry_contact_type_code;

ALTER TABLE mine_report_notification 
    ADD CONSTRAINT mine_report_notification_contact_guid_fkey 
    FOREIGN KEY (contact_guid) REFERENCES ministry_contact (contact_guid);