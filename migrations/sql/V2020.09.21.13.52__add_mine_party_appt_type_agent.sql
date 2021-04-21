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
    ('AGT', 'Agent', 14, 'system-mds', 'system-mds', 'true', 'true', 1)
ON CONFLICT DO NOTHING;