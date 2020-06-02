INSERT INTO bond_document_type
    (
    bond_document_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('CON', 'Change of Name Certificate', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;