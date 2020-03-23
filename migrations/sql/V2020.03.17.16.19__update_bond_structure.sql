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

COMMENT ON TABLE bond IS 'As a condition of Mines Act permits, a permittee is required to provide a monetary security to cover reclamation costs, and to provide for protection of, and mitigation of damage to, watercourses and cultural heritage resources affected by the mine. Securities are held in one or more bonds, which are (essentially) loans acquired between mining parties and financial institutions and are in a variety of types, such as; cash, money order, bank draft, safekeeping agreements, etc.';

COMMENT ON TABLE bond_type IS 'Contains a list of methods used to secure a bond with the Ministry. Bond types include; Cash, Qualified Environmental Trust, Section 12 Reclamation, Asset Security Agreement, Surety Bond, Irrevocable Letter of Credit, Safekeeping Agreement.';

COMMENT ON TABLE bond_status IS 'Contains a list of bond statuses. Examples include; Released, Confiscated, Active.';

COMMENT ON TABLE bond_permit_xref IS 'Cross-reference table to relate the bond(s) to a mine''s permits. A mine may provide multiple bonds to cover the security deposit, which is tied to the conditions of a permit.';
