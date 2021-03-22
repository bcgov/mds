INSERT INTO application_type_code
(
    application_type_code,
    description,
    create_user,
    update_user,
    active_ind
)
VALUES 
    ('NOW', 'Notice of Work Application','system-mds', 'system-mds', 'true'),
    ('ADA', 'Admin Amendment','system-mds', 'system-mds', 'true')
ON CONFLICT DO NOTHING;

ALTER TABLE now_application_identity ADD COLUMN application_type_code varchar(3);
ALTER TABLE now_application_identity ADD CONSTRAINT application_type_code_fk FOREIGN KEY (application_type_code) REFERENCES application_type_code (application_type_code);

INSERT INTO amendment_reason_code
(
    amendment_reason_code,
    description,
    create_user,
    update_user,
    active_ind
)
VALUES 
    ('EXT', 'Extension to the authorization end date','system-mds', 'system-mds', 'true'),
    ('CHP', 'Change of permittee','system-mds', 'system-mds', 'true'),
    ('MYA', 'MYAB updates','system-mds', 'system-mds', 'true'),
    ('TRP', 'Transfer a permit to another party','system-mds', 'system-mds', 'true'),
    ('INR', 'Inspector requests','system-mds', 'system-mds', 'true')
ON CONFLICT DO NOTHING;

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('AMR', 'Amendment Request', true, null, 'system-mds', 'system-mds'),
    ('MYA', 'MYAB Update Form', true, null, 'system-mds', 'system-mds'),
    ('SUD', 'Supporting Documents', true, null, 'system-mds', 'system-mds');
