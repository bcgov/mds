UPDATE now_application_document_type SET description = 'Notice of Work Form' WHERE now_application_document_type_code = 'NTR';
UPDATE document_template SET template_file_path = 'templates/now/Notice of Work Form.docx' WHERE document_template_code = 'NTR';
UPDATE document_template SET form_spec_json = '' WHERE document_template_code = 'NTR';