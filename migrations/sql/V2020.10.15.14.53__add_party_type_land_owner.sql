INSERT INTO mine_party_appt_type_code
    (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
    )
VALUES
    ('LDO', 'Land Owner', 260, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('STO', 'Site Operator', 270, 'system-mds', 'system-mds', 'true', 'false', 1)
ON CONFLICT DO NOTHING;