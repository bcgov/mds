INSERT INTO mds_required_document_category
    (
    req_document_category_guid,
    req_document_category
    )
VALUES
    ('6ab98b9a-0e66-4f26-99de-e3c270dea7b6', 'MINE_TAILINGS'),
    ('6ab98b9a-0e66-4f26-99de-e3c270dea7b7', 'MINE_OTHER')
ON CONFLICT DO NOTHING;

INSERT INTO required_document_due_date_type(
    req_document_due_date_type,
    req_document_due_date_description,
    ACTIVE_IND,
    create_user,
    update_user
)
VALUES
    ('FIS','Reports due on fiscal year end.', 'true', 'system-mds', 'system-mds'),
    ('ANV','Reports due on an aniversary of operation, permit, etc...', 'true', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mds_required_document (
    req_document_name,
    req_document_description,
    req_document_category_guid,
    ACTIVE_IND,
    req_document_due_date_type,
    req_document_due_date_period_months,
    create_user,
    update_user
    )
VALUES
    ('Annual Reclamation', '10.4.4a', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Annual DSI', '10.4.4b', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('5 year DSR', '10.5.4', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 60, 'system-mds', 'system-mds'),
    ('ITRB Activities (Annual)', '10.4.4c', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Register of tailings storage facilities and dams', '10.4.3', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('MERP Record of Testing', '3.7.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Annual Manager''s Report', '10.4.4', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('OMS Manual', '10.5.2', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('Annual reconciliation of water balance and water management plans', '10.4.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('TSF risk assessment', '10.4.2', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 12, 'system-mds', 'system-mds'),
    ('Mine Emergency Preparedness and Response Plan (MERP)', '3.7.1', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','ANV', 0, 'system-mds', 'system-mds'),
    ('Annual TSF and Dam safety recommendations', '10.4.4d', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('Performance of high risk dumps', '10.4.4e', '6ab98b9a-0e66-4f26-99de-e3c270dea7b6','true','FIS', 12, 'system-mds', 'system-mds'),
    ('OTHER_TEST_REPORT', 'testing filter on category', '6ab98b9a-0e66-4f26-99de-e3c270dea7b7','true','ANV', 12, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;