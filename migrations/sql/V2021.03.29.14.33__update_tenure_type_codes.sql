UPDATE mine_tenure_type_code SET description = 'Public Land' WHERE mine_tenure_type_code = 'BCL';

INSERT INTO mine_tenure_type_code
    (
    mine_tenure_type_code,
    description,
    active_ind,
    create_user,
    update_user
    )
VALUES
    ('PRL', 'Private Land', TRUE, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO mine_disturbance_tenure_type
(
    mine_disturbance_code,
    mine_tenure_type_code
)
VALUES 
    ('SUR', 'PRL')
ON CONFLICT DO NOTHING;


INSERT INTO mine_commodity_tenure_type
(
    mine_commodity_code,
    mine_tenure_type_code
)
VALUES 
    ('CG','PRL'),
    ('SA','PRL')
ON CONFLICT DO NOTHING;