INSERT INTO BOND_TYPE 
(
    bond_type_code,
    description,
    active_ind,
    create_user,
    update_user
)
VALUES
    ('PFB', 'Performance Bond', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;