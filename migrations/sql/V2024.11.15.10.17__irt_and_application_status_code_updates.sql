ALTER TABLE major_mine_application_status_code DROP COLUMN display_order;

INSERT INTO information_requirements_table_status_code (
    information_requirements_table_status_code,
    description,
    create_user,
    update_user    
) VALUES
    ('OHD', 'On Hold', 'system-mds', 'system-mds'),
    ('WDN', 'Withdrawn', 'system-mds', 'system-mds'),
    ('COM', 'Complete', 'system-mds', 'system-mds')
;

INSERT INTO major_mine_application_status_code (
    major_mine_application_status_code,
    description,
    create_user,
    update_user
) VALUES 
    ('OHD', 'On Hold', 'system-mds', 'system-mds'),
    ('WDN', 'Withdrawn', 'system-mds', 'system-mds'),
    ('COM', 'Complete', 'system-mds', 'system-mds')
;

UPDATE information_requirements_table SET status_code = 'COM' WHERE status_code = 'APV';
UPDATE major_mine_application SET status_code = 'COM' WHERE status_code = 'APV';

DELETE FROM information_requirements_table_status_code WHERE information_requirements_table_status_code = 'APV';
DELETE FROM major_mine_application_status_code WHERE major_mine_application_status_code = 'APV';