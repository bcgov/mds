INSERT INTO document_template
    (document_template_code, template_file_path, active_ind, create_user, update_user, form_spec_json)
VALUES
    ('NTR', 'templates/now/NOW Technical Review.docx', true, 'system-mds', 'system-mds', '');

INSERT INTO now_application_document_type
    (now_application_document_type_code, description, active_ind, create_user, update_user, document_template_code)
VALUES
    ('NTR', 'Technical Review', true, 'system-mds', 'system-mds', 'NTR');