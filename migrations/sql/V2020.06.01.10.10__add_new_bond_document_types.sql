ALTER TABLE bond_document_type ADD COLUMN
IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

UPDATE bond_document_type SET description = 'Acknowledgement of Security Letter' WHERE bond_document_type_code = 'AKL';
UPDATE bond_document_type SET description = 'Scan of Reclamation Security Document' WHERE bond_document_type_code = 'SRB';
UPDATE bond_document_type SET active_ind = false WHERE bond_document_type_code = 'REL';

UPDATE bond_document_type SET display_order = 10 WHERE bond_document_type_code = 'AKL';
UPDATE bond_document_type SET display_order = 40 WHERE bond_document_type_code = 'CSF';
UPDATE bond_document_type SET display_order = 50 WHERE bond_document_type_code = 'CSL';
UPDATE bond_document_type SET display_order = 70 WHERE bond_document_type_code = 'RSF';
UPDATE bond_document_type SET display_order = 80 WHERE bond_document_type_code = 'RSL';
UPDATE bond_document_type SET display_order = 90 WHERE bond_document_type_code = 'REL';
UPDATE bond_document_type SET display_order = 100 WHERE bond_document_type_code = 'SRB';


INSERT INTO bond_document_type
    (
    bond_document_type_code,
    description,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('CNC', 'Change of Name Certificate', 'system-mds', 'system-mds', 30),
    ('BSR', 'Bond Status Request Letter', 'system-mds', 'system-mds', 20),
    ('NIA', 'No Interest Acknowledgement Form', 'system-mds', 'system-mds', 60),
    ('SIB', 'Security Instructions for Bank', 'system-mds', 'system-mds', 110)
ON CONFLICT DO NOTHING;
