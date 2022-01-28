INSERT INTO now_application_delay_type (
    delay_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('NRT', 'Nation Requests Additional Time','system-mds', 'system-mds')

ON CONFLICT DO NOTHING;
