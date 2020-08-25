INSERT INTO permit_status_code
    (
    permit_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('D', 'Draft', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;