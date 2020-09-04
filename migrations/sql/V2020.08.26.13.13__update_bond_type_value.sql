UPDATE bond_type 
SET description = 'Letter of Credit'
WHERE bond_type_code  = 'ILC';

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

ALTER TABLE mine_document ADD COLUMN document_date TIMESTAMP WITH TIME ZONE;