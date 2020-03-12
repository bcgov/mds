
-- Add a new NoW document type for the security calculation document
INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES ('SCD', 'Security Calculation Document', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Add new columns to NoW Application for the security total and received date
ALTER TABLE now_application ADD COLUMN security_total NUMERIC(10, 2);
ALTER TABLE now_application ADD COLUMN security_received_date DATE;