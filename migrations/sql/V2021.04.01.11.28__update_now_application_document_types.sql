-- Create some new Notice of Work Application Document Sub-Types
INSERT INTO now_application_document_sub_type
    (now_application_document_sub_type_code, description, active_ind, create_user, update_user)
VALUES
    ('AAF', 'Additional Application Files', true, 'system-mds', 'system-mds'),
    ('AEF', 'Application Export Files', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Create an "Other" document type for "Additional Application Files"
INSERT INTO now_application_document_type
    (now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('OTA', 'Other', true, 'AAF', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Create a copy of the "Proposed and/or Permitted Mine Area Map" document for "Government Documents"
INSERT INTO now_application_document_type
    (now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('MPG', 'Proposed and/or Permitted Mine Area Map', true, 'GDO', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Set "Government Documents" sub-type for some documents
UPDATE now_application_document_type SET now_application_document_sub_type_code = 'GDO' WHERE now_application_document_type_code IN ('ECC', 'NPR', 'NPI', 'NPE', 'RFD', 'RMI', 'REV');

-- Set "Map Documents" sub-type for some documents
UPDATE now_application_document_type SET now_application_document_sub_type_code = 'MDO' WHERE now_application_document_type_code IN ('CSL', 'SSF');

-- Set "Application Export Files" sub-type for some documents
UPDATE now_application_document_type SET now_application_document_sub_type_code = 'AEF' WHERE now_application_document_type_code IN ('NTR', 'PMT', 'PMA');

-- Set "Additional Application Files" sub-type for some documents
UPDATE now_application_document_type SET now_application_document_sub_type_code = 'AAF' WHERE now_application_document_type_code IN ('ARE', 'ANS', 'ACP', 'AIA', 'AOA', 'BLP', 'DWP', 'EMS', 'FDP', 'LAL', 'LNO', 'MAD', 'MRP', 'OMP', 'PFR', 'RPL', 'RFE', 'RSP', 'SEP', 'SOP', 'TAL', 'TSS', 'VMP', 'WMP', 'WPL', 'AMR', 'MYA', 'SUD');

-- Fix typo in description: 'Requst for More Information' --> 'Request for More Information'
UPDATE now_application_document_type SET description = 'Request for More Information' WHERE now_application_document_type_code = 'RMI';

-- Fix typo in description: 'Land Title/Licence of Ocupation Map' --> 'Land Title/Licence of Occupation Map'
UPDATE now_application_document_type SET description = 'Land Title/Licence of Occupation Map' WHERE now_application_document_type_code = 'LTM';

-- Fix typo in description: 'Preliminary Field Reconnaisance' --> 'Preliminary Field Reconnaissance'
UPDATE now_application_document_type SET description = 'Preliminary Field Reconnaissance' WHERE now_application_document_type_code = 'PFR';
