CREATE TABLE IF NOT EXISTS now_application_document_sub_type (
    now_application_document_sub_type_code   varchar(3) PRIMARY KEY,
    description                              varchar(50),
    active_ind                               boolean DEFAULT true NOT NULL,
    create_user                              character varying(60) NOT NULL,
    create_timestamp                         timestamp with time zone DEFAULT now() NOT NULL,
    update_user                              character varying(60) NOT NULL,
    update_timestamp                         timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO now_application_document_sub_type
(now_application_document_sub_type_code, description, active_ind, create_user, update_user)
values
('SDO', 'Securities Documents', true, 'system-mds', 'system-mds'),
('GDO', 'Government Documents', true, 'system-mds', 'system-mds'),
('MDO', 'Map Documents', true, 'system-mds', 'system-mds')
on conflict do nothing;

ALTER TABLE now_application_document_type ADD COLUMN now_application_document_sub_type_code varchar REFERENCES now_application_document_sub_type(now_application_document_sub_type_code);

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('LMA', 'Location Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('LTM', 'Land Title/Licence of Ocupation Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('OMA', 'Overview Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SMA', 'Supplemental Map', true, 'MDO', 'system-mds', 'system-mds'),
    ('SSF', 'Submitted Shape Files', true, NULL, 'system-mds', 'system-mds'),
    ('CSL', 'Cross-sectional/Longitudinal', true, NULL, 'system-mds', 'system-mds'),
    ('PFR', 'Preliminary Field Reconnaisance', true, NULL, 'system-mds', 'system-mds'),
    ('AOA', 'Archaeological Overview Assessment', true, NULL, 'system-mds', 'system-mds'),
    ('AIA', 'Archaeological Impact Assessment', true, NULL, 'system-mds', 'system-mds'),
    ('SOP', 'Standard/Safe Operating Procedures', true, NULL, 'system-mds', 'system-mds'),
    ('RSP', 'Riparian Setbacks Plan', true, NULL, 'system-mds', 'system-mds'),
    ('WMP', 'Water Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('WPL', 'Wildlife Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('RPL', 'Reclamation Plan', true, NULL, 'system-mds', 'system-mds'),
    ('OMP', 'Other Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('SEP', 'Sediment and Erosion Control Plan', true, NULL, 'system-mds', 'system-mds'),
    ('FDP', 'Fugitive Dust Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('VMP', 'Vegetation Management Plan', true, NULL, 'system-mds', 'system-mds'),
    ('TSS', 'Terrain Stability Study', true, NULL, 'system-mds', 'system-mds'),
    ('MAD', 'Metal Leaching/Acid Rock Drainage', true, NULL, 'system-mds', 'system-mds'),
    ('LNO', 'Landowner Notification', true, NULL, 'system-mds', 'system-mds'),
    ('DWP', 'Description of Work/Work Program', true, NULL, 'system-mds', 'system-mds'),
    ('ARE', 'Agent Letter of Representation', true, NULL, 'system-mds', 'system-mds'),
    ('SRE', 'Status Report', true, 'GDO', 'system-mds', 'system-mds'),
    ('SOM', 'Status Report - Overlapping Interests Maps', true, 'GDO', 'system-mds', 'system-mds'),
    ('SRS', 'Status Report - Shape Files', true, 'GDO', 'system-mds', 'system-mds'),
    ('ECC', 'Email Correspondence/Communications', true, NULL, 'system-mds', 'system-mds'),
    ('RMI', 'Requst for More Information', true, NULL, 'system-mds', 'system-mds'),
    ('WFI', '30 day Warning for Information', true, 'GDO', 'system-mds', 'system-mds'),
    ('NPR', 'No Permit Required', true, NULL, 'system-mds', 'system-mds'),
    ('NPI', 'No Permit Required IP', true, NULL, 'system-mds', 'system-mds'),
    ('WFS', '30 day Warning for Security', true, 'SDO', 'system-mds', 'system-mds'),
    ('PEL', 'Permit Enclosed Letter', true, NULL, 'system-mds', 'system-mds'),
    ('RFD', 'Reasons for Decision', true, NULL, 'system-mds', 'system-mds')
on conflict do nothing;

UPDATE now_application_document_type set description='Proposed and/or Permitted Mine Area Map' where now_application_document_type_code='MPW';
UPDATE now_application_document_type set now_application_document_sub_type_code='MDO' where now_application_document_type_code='MPW';
UPDATE now_application_document_type set description='Title/Tenure Map' where now_application_document_type_code='TMP';
UPDATE now_application_document_type set now_application_document_sub_type_code='MDO'  where now_application_document_type_code='TMP';
UPDATE now_application_document_type set description='Bond Calculator' where now_application_document_type_code='SCD';
UPDATE now_application_document_type set now_application_document_sub_type_code='SDO' where now_application_document_type_code='SCD';
UPDATE now_application_document_type set now_application_document_sub_type_code='SDO' where now_application_document_type_code='SRB';
UPDATE now_application_document_type set now_application_document_sub_type_code='SDO' where now_application_document_type_code='NIA';
UPDATE now_application_document_type set now_application_document_sub_type_code='SDO' where now_application_document_type_code='AKL';
UPDATE now_application_document_type set now_application_document_sub_type_code='GDO' where now_application_document_type_code='CAL';
UPDATE now_application_document_type set now_application_document_sub_type_code='GDO' where now_application_document_type_code='OTH';
UPDATE now_application_document_type set now_application_document_sub_type_code='GDO' where now_application_document_type_code='WDL';
UPDATE now_application_document_type set now_application_document_sub_type_code='GDO' where now_application_document_type_code='RJL';
