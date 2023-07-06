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
      "id": "application_dt_label",
      "type": "LABEL",
	  "context-value": "Please find enclosed your Mines Act permit, which authorizes exploration activities as detailed in the Notice of Work and Reclamation Program dated"
	},
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
	{ 
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "The Notice of Work and Reclamation Program form part of your permit, and you are reminded that you may not depart from the permitted program without written authorization."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Please ensure that you and all persons who are carrying out activities in accordance with this permit comply with all terms and conditions of the permit and are familiar with the permitted work program.\n\nThis permit applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. Examples of other authorizations would be for timber removal, water use, works within the agricultural land reserve etc.\n\nYou are reminded of Code requirement for the mine manager to develop, and file with the Chief Inspector of Mines, a Mine Emergency Response Plan (MERP), which shall be kept up to date and followed in the event of an emergency. The MERP must be filed as a Code Required Report under Part 3.7.1 prior to start of work (Part 6.2.1)",
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
    },
    {
      "id": "permit_no",
      "relative-data-path": "now_application.permit.permit_no",
      "read-only": true
    }
  ]' WHERE document_template_code ='NPE';