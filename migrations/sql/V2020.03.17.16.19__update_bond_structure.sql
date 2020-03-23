ALTER TABLE bond ADD COLUMN institution_name varchar,
ADD COLUMN institution_street varchar,
ADD COLUMN institution_city varchar,
ADD COLUMN institution_province varchar,
ADD COLUMN institution_postal_code varchar,
ADD COLUMN note varchar,
ADD COLUMN issue_date timestamp,
ADD COLUMN project_id varchar,
ALTER COLUMN amount DROP NOT NULL,
ADD CONSTRAINT bond_institution_province_fk FOREIGN KEY (institution_province) REFERENCES sub_division_code(sub_division_code),
DROP CONSTRAINT bond_institution_party_guid_fkey,
DROP COLUMN institution_party_guid;

INSERT INTO bond_type(
    bond_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('QET', 'Qualified Environmental Trust', 'system-mds', 'system-mds'),
    ('STR', 'Section 12 Reclamation', 'system-mds', 'system-mds'),
    ('ASA', 'Asset Security Agreement', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

DELETE from bond_type where bond_type_code in ('CEC', 'MOR', 'BDA');
