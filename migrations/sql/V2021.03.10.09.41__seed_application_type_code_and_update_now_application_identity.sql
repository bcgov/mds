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