UPDATE information_requirements_table_status_code SET description = 'Pending Review' WHERE information_requirements_table_status_code = 'REC';
UPDATE information_requirements_table_status_code SET description = 'In Review' WHERE information_requirements_table_status_code = 'UNR';
UPDATE information_requirements_table_status_code SET description = 'Review Complete' WHERE information_requirements_table_status_code = 'APV';

INSERT INTO information_requirements_table_status_code (information_requirements_table_status_code, description, create_user, update_user) VALUES ('CHR', 'Change Requested', 'system-mds', 'system-mds');