
-- Add a new NoW document type for the security calculation document
INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
	('SCA', 'Security Calculation', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Add a new column to NoW Application for the security amount
ALTER TABLE now_application ADD COLUMN security_amount NUMERIC(10, 2);