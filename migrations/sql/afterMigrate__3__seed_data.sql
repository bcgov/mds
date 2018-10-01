INSERT INTO permit_status_code (
    permit_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('N', 'New permit', 10, 'system-mds', 'system-mds'),
    ('A', 'Ammended Permit', 20, 'system-mds', 'system-mds'),
    ('Z', 'Permit Not required', 30, 'system-mds', 'system-mds'),
    ('M', 'Permit type not selected', 40, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO party_type_code (
    party_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('PER', 'Person', 10, 'system-mds', 'system-mds'),
    ('ORG', 'Organization', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;