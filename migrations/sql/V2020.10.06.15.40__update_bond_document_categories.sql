INSERT INTO bond_document_type(
    bond_document_type_code,
    description,
    active_ind,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('PRL', 'Payment Reminder Letter', true, 'system-mds', 'system-mds', 120),
    ('BAL', 'Bank Acknowledgement Letter', true, 'system-mds', 'system-mds', 130)
ON CONFLICT DO NOTHING;

UPDATE bond_document_type set description = 'No Interest Payable Form' where bond_document_type_code = 'NIA';
