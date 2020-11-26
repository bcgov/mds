INSERT INTO now_application_document_type
    (now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
    ('NPE', 'Permit Enclosed Letter', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
