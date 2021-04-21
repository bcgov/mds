ALTER TABLE now_application_progress_status ADD COLUMN display_order INTEGER;

UPDATE now_application_progress_status SET display_order = 10 WHERE application_progress_status_code = 'REV';
UPDATE now_application_progress_status SET display_order = 20 WHERE application_progress_status_code = 'REF';
UPDATE now_application_progress_status SET display_order = 30 WHERE application_progress_status_code = 'CON';
UPDATE now_application_progress_status SET display_order = 40 WHERE application_progress_status_code = 'PUB';
UPDATE now_application_progress_status SET display_order = 50 WHERE application_progress_status_code = 'DFT';