DO $$
DECLARE
    max_display_order integer;
    min_display_order integer;
    display_order_irs integer;
   
BEGIN
    SELECT MAX(display_order)
    INTO max_display_order
    FROM mine_incident_status_code;

    --Add a new Written Notice Submitted status
    INSERT INTO mine_incident_status_code
        (mine_incident_status_code, description, display_order, create_user, update_user)
    VALUES
        ('WNS', 'Written Notice Submitted',max_display_order + 10,'system-mds','system-mds');

    -- Update existing mine incidents with status IRS to WNS
    UPDATE mine_incident
    SET status_code = 'WNS'
    where status_code = 'IRS';

    SELECT display_order
    INTO display_order_irs
    FROM mine_incident_status_code
    WHERE mine_incident_status_code = 'IRS';

    -- Delete old mine incident status IRS
    DELETE
    FROM mine_incident_status_code 
    where mine_incident_status_code = 'IRS';
   
    -- Update display order with the values of IRS
    UPDATE mine_incident_status_code 
    SET display_order = display_order_irs
    where mine_incident_status_code = 'WNS';

    -- Make space for two status codes
    UPDATE mine_incident_status_code
    SET display_order = display_order + 20
    where mine_incident_status_code in ('AFR','FRS','UNR','INV','MIU','CLD','DFT');
   
    SELECT MIN(display_order)
    INTO min_display_order
    FROM mine_incident_status_code
    where mine_incident_status_code in ('AFR','FRS','UNR','INV','MIU','CLD','DFT');

    -- Use space for two status codes
    INSERT INTO mine_incident_status_code
        (mine_incident_status_code, description, display_order, create_user, update_user)
    VALUES ('RSS', 'Reviewing Severity Status',min_display_order - 20,'system-mds','system-mds'),
           ('IMS', 'Information Missing Status',min_display_order - 10,'system-mds','system-mds');

END $$;