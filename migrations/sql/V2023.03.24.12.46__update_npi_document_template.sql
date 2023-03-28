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
      "id": "property",
      "relative-data-path": "now_application.property_name",
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
      "id": "now_num",
      "relative-data-path": "now_application.now_number",
      "read-only": true
    },
    { 
      "id": "application_dt_label",
      "type": "LABEL",
	    "context-value": "I am writing to acknowledge receipt of your Notice of Work dated:"
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
      "id": "application_dt_end_label",
      "type": "LABEL",
	    "context-value": "for an Induced Polarization (IP) survey program."
	  },
    { 
      "id": "start_dt_label",
      "type": "LABEL",
	    "context-value": "Due to the nature of the proposed work, you are exempted under subsection 10 (2) of the Mines Act from the requirement to holda Mines Act permit for the IP survey program described in your Notice of Work application, and as shown on the maps in your Notice of Work, for the exemption period from Start Date "
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
      "id": "end_dt_label",
      "type": "LABEL",
	    "context-value": "to Completion Date"
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
      "id": "letter_body_label",
      "type": "LABEL",
	    "context-value": "subject to the following conditions:\n1. You must provide the Inspector written notification of your intent to commence work at least 10 days prior to doing so;\n2. You must provide the Inspector written notice at least 7 days prior to ceasing work on the program;\n3. For work conducted during each year of the exemption period, you must complete an Annual Summary of Exploration Activities which can be found at https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reporting-forms, and submit that to the Inspector by March 31 of the following year. \n\nYou are reminded that Part 9.3.5, Induced Polarization Geophysical Systems, of the Health, Safety and Reclamation Code for Mines in British Columbia (the Code) applies to your IP survey program.\n\nPlease note that this exemption applies only to the permit requirement under subsection 10(1) of the Mines Act. All other sections of the Mines Act and the Code continue to apply.  It is your responsibility to comply with all other applicable legislation,and the terms and conditions of all other permits and authorizations which may be required under other legislation.\n\nThe BC Wildfire Management Branch requires all persons carrying out industrial activities between March 1st and November 1st each year, to provide emergency contact information. You can submit this form to the local BC Fire Centre: https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/wildfire-status/prevention/prevention-industry-comm-ops/emergency-contact-information/bcws_emergency_contact_info_form_fs1404.pdf\n\nIf your work plans should change and more intensive exploration is anticipated, please submit another Notice of Work providing the appropriate information.To clarify or discuss any of the above, please call this office.",
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
  ]' WHERE document_template_code ='NPI';