INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
    ('SRB', 'Scan of Reclamation Security Document', true, 'system-mds','system-mds'),
    ('NIA', 'No Interest Acknowledgement Form', true, 'system-mds','system-mds'),
    ('AKL', 'Acknowledgement of Security Letter', true, 'system-mds','system-mds')
on conflict do nothing;


ALTER TABLE permit_amendment ADD COLUMN security_received_date DATE;