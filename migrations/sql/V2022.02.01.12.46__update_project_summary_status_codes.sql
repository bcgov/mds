ALTER TABLE project_summary_status_code add column alias_description character varying(100);

UPDATE project_summary_status_code SET active_ind = FALSE WHERE project_summary_status_code = 'OPN';
UPDATE project_summary_status_code SET alias_description = 'Open' WHERE project_summary_status_code = 'OPN';

UPDATE project_summary_status_code SET active_ind = FALSE WHERE project_summary_status_code = 'CLD';
UPDATE project_summary_status_code SET alias_description = 'Closed' WHERE project_summary_status_code = 'CLD';

UPDATE project_summary_status_code SET alias_description = 'Draft' WHERE project_summary_status_code = 'DFT';
UPDATE project_summary_status_code SET alias_description = 'Withdrawn' WHERE project_summary_status_code = 'WDN';

INSERT INTO project_summary_status_code (
    project_summary_status_code, 
    description, 
    alias_description,
    display_order, 
    active_ind, 
    create_user, 
    update_user
    )
VALUES 
    ('ASG', 'Assigned', 'Submitted', 50, true, 'system-mds', 'system-mds'),
    ('UNP', 'Under review - with proponent', 'Under review', 60, true, 'system-mds', 'system-mds'),
    ('UNR', 'Under review - with reviewers', 'Under review', 70, true, 'system-mds', 'system-mds'),
    ('COM', 'Complete', 'Complete', 80, true, 'system-mds', 'system-mds'),
    ('OHD', 'On Hold', 'On Hold', 90, true, 'system-mds', 'system-mds'),
    ('IAT', 'Inactive', 'Inactive', 100, true, 'system-mds', 'system-mds'),
    ('SUB', 'Submitted', 'Submitted', 200, true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

update project_summary set status_code = 'SUB' where status_code = 'OPN';