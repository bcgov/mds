-- This migration updates the now_application_status_code for specific now_application_id entries
-- to reflect changes made since the last backup.

UPDATE now_application SET now_application_status_code = 'CDI' WHERE now_application_id = 2718;
UPDATE now_application SET now_application_status_code = 'CDI' WHERE now_application_id = 2758;
UPDATE now_application SET now_application_status_code = 'RCO' WHERE now_application_id = 3004;
UPDATE now_application SET now_application_status_code = 'CDI' WHERE now_application_id = 3273;
UPDATE now_application SET now_application_status_code = 'REF' WHERE now_application_id = 3395;
UPDATE now_application SET now_application_status_code = 'REF' WHERE now_application_id = 3427;
UPDATE now_application SET now_application_status_code = 'GVD' WHERE now_application_id = 3614;