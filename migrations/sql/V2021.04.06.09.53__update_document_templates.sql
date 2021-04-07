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
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
	{ 
      "id": "withdrawal_dt_label",
      "type": "LABEL",
	  "context-value": "I refer to your decision of"
	},
    {
      "id": "withdrawal_dt",
      "label": "Withdrawal Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
	{ 
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "to withdraw your Notice of Work application and confirm that all further processing of your application has now been terminated."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You will have to reapply should you wish to carry out your intended work program. You are reminded that pursuant to Section 10 of the Mines Act no exploration activities can be carried out unless you have received the required permit.",
      "required": true
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
  ]' WHERE document_template_code ='NWL';
