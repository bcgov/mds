INSERT INTO bond_document_type
    (
    bond_document_type_code,
    description,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('SRB', 'Scan of Reclamation Security Bond', 'system-mds', 'system-mds', 120)
ON CONFLICT DO NOTHING;
