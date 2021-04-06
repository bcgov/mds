INSERT INTO exemption_fee_status
    (
    exemption_fee_status_code,
    description,
    display_order,
    create_user,
    update_user,
    active_ind
    )
VALUES
    ('MIM', 'Mineral/Coal', 130, 'system-mds', 'system-mds', true),
    ('MIP', 'Pits/Quarry', 140, 'system-mds', 'system-mds', true)
ON CONFLICT DO NOTHING;