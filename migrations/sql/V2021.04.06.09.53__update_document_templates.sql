INSERT INTO document_template
(document_template_code, form_spec_json, template_file_path, active_ind, create_user, update_user)
VALUES
  ('NPR', '' , 'templates/now/No Permit Required Letter.docx', true, 'system-mds', 'system-mds'),
  ('NPI', '' , 'templates/now/No Permit Required IP Letter.docx', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

UPDATE now_application_document_type
SET document_template_code = 'NPR'
where now_application_document_type_code = 'NPR';

UPDATE now_application_document_type
SET document_template_code = 'NPI'
where now_application_document_type_code = 'NPI';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "now_num",
      "relative-data-path": "now_application.now_number",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "start_dt",  
      "label": "Application Start Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_start_date",
      "required": true
    },
    {
      "id": "end_dt",  
      "label": "Application End Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_end_date",
      "required": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "Sincerely,"
	},
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPR';

  UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "mine_no",
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "now_num",
      "relative-data-path": "now_application.now_number",
      "read-only": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the proponent''s name",
      "relative-data-path": "now_application.permittee.name",
      "required": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "AUTO_SIZE_FIELD",
      "placeholder": "Enter the proponent''s address",
      "relative-data-path": "now_application.permittee.first_address.full",
      "required": true
    },
    {
      "id": "start_dt",  
      "label": "Application Start Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_start_date",
      "required": true
    },
    {
      "id": "end_dt",  
      "label": "Application End Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "relative-data-path": "now_application.proposed_end_date",
      "required": true
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "Sincerely,"
	},
    {
      "id": "issuing_inspector_name",
      "relative-data-path": "now_application.issuing_inspector.name",
      "read-only": true
    },
    {
      "id": "issuing_inspector_email",
      "relative-data-path": "now_application.issuing_inspector.email",
      "read-only": true
    },
    {
      "id": "issuing_inspector_phone",
      "relative-data-path": "now_application.issuing_inspector.phone",
      "read-only": true
    },
    {
      "id": "rc_office_email",
      "relative-data-path": "mine.region.regional_contact_office.email",
      "read-only": true
    },
    {
      "id": "rc_office_phone_number",
      "relative-data-path": "mine.region.regional_contact_office.phone_number",
      "read-only": true
    },
    {
      "id": "rc_office_fax_number",
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPI';
