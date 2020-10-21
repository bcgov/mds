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
    ('LDO', 'Land Owner', 260, 'system-mds', 'system-mds', 'true', 'false', 1)
ON CONFLICT DO NOTHING;

UPDATE mine_party_appt_type_code SET description = 'Site Operator' WHERE mine_party_appt_type_code = 'MOR';