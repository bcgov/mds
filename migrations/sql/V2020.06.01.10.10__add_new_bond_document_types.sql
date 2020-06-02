UPDATE bond_document_type SET description = 'Acknowledgement of Security Letter' WHERE bond_document_type_code = 'AKL';
UPDATE bond_document_type SET description = 'Scan of Reclamation Security Document' WHERE bond_document_type_code = 'SRB';
UPDATE bond_document_type SET active_ind = FALSE WHERE bond_document_type_code = 'REL';

INSERT INTO bond_document_type
    (
    bond_document_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('CNC', 'Change of Name Certificate', 'system-mds', 'system-mds'),
    ('BSR', 'Bond Status Request Letter', 'system-mds', 'system-mds'),
    ('NIA', 'No Interest Acknowledgement Form', 'system-mds', 'system-mds'),
    ('SIB', 'Security Instructions for Bank', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
