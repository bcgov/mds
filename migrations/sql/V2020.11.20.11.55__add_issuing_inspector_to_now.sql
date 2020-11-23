ALTER TABLE now_application
ADD COLUMN issuing_inspector_party_guid uuid;

ALTER TABLE now_application
ADD CONSTRAINT now_application_party_issuing_inspector_fkey
FOREIGN KEY (issuing_inspector_party_guid) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE permit_amendment 
RENAME lead_inspector_title TO issuing_inspector_title;

UPDATE document_template SET template_file_path = 'templates/now/Technical Review.docx' WHERE document_template_code = 'NTR';
UPDATE document_template SET template_file_path = 'templates/now/Rejection Letter.docx' WHERE document_template_code = 'NRL';
UPDATE document_template SET template_file_path = 'templates/now/Withdrawal Letter.docx' WHERE document_template_code = 'NWL';
UPDATE document_template SET template_file_path = 'templates/now/Acknowledgment Letter.docx' WHERE document_template_code = 'NCL';
UPDATE document_template SET template_file_path = 'templates/permit/Permit.docx' WHERE document_template_code = 'PMT';
UPDATE document_template SET template_file_path = 'templates/permit/Permit.docx' WHERE document_template_code = 'PMA';
