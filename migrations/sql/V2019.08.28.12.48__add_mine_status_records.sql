INSERT INTO mine_status_xref (
    mine_operation_status_code,
    mine_operation_status_reason_code,
    mine_operation_status_sub_reason_code,
    create_user,
    update_user,
    description
)
VALUES
('OP', NULL, NULL, 'system-mds', 'system-mds', 'This mine operates year-round (can be conducting exploration and/or production activities).'),
('CLD', 'REC', NULL, 'system-mds', 'system-mds', 'The mine is closed and not expected to re-open.'),
('CLD', 'ORP', NULL, 'system-mds', 'system-mds', 'The permittee is not able or available to meet permit obligations.')
ON CONFLICT DO NOTHING;
