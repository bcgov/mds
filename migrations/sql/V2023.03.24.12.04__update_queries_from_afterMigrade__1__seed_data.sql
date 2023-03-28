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
      "id": "emailed_to",
      "label": "Emailed to",
      "type": "FIELD",
      "placeholder": "Enter the name of the email recipient",
      "relative-data-path": "now_application.permittee.email"
    },
    {
      "id": "property",
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
	{ 
      "id": "application_dt_label",
      "type": "LABEL",
	  "context-value": "This letter acknowledges receipt of your Notice of Work and Reclamation Program dated"
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
      "id": "exploration_type_label",
      "type": "LABEL",
	  "context-value": "Your proposed program of"
	},
    {
      "id": "exploration_type",
      "label": "Exploration Type",
      "type": "FIELD",
      "placeholder": "Enter the exploration type",
      "required": true
    },
	{ 
      "id": "bond_inc_amt_label",
      "type": "LABEL",
	  "context-value": "has been referred to other resource agencies and has been sent to Indigenous Nations for consultation. Prior to the approval and issuance of your permit, you are required to post a security deposit of"
	},
    {
      "id": "bond_inc_amt",
      "label": "Bond Increase Amount",
      "type": "CURRENCY",
      "placeholder": "Enter the bond increase amount",
      "relative-data-path": "now_application.liability_adjustment"
    },
	{ 
      "id": "letter_body_label",
      "type": "LABEL",
	  "context-value": "and you may wish to take the opportunity to post your security at this time to avoid any delays.  Safekeeping Agreements backed by GIC’s may be used for bonds under $25,000 with the enclosed template. Complete the form with your banker, using the ''Instructions on Completing a Safekeeping Agreement'' and return it to this office for our signature.  A copy of the completed form will be returned to you and your financial institution.  Irrevocable Letters of Credit, certified cheque, bank draft or money order made payable to the Minister of Finance, at the undernoted address, are also acceptable. Payments made by EFT can also be arranged. Please do not send cash. For reclamation surety bonds, the bond shall be with a surety licensed to transact the business of a surety in Canada. For the surety bond template and more please visit our Reclamation Security website. Personal information collected by the Ministry of Energy, Mines, and Low Carbon Innovation is under the authority of section 26(c) of the Freedom of Information and Protection of Privacy Act for the purpose of collecting Bond and Securities Data. If you have any questions about the collection, use and disclosure of your personal information, please contact: Mines Digital Services by email at mds@gov.bc.ca, by phone at: 778-698-7233, or by mail at: PO Box 9380, STN PROV GOVT, Victoria, BC, V8W 9M6."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
      "required": true
    },
	{ 
      "id": "issuing_inspector_name_label",
      "type": "LABEL",
	  "context-value": "You are reminded that no work may commence until you have received your permits. To clarify or discuss any of the above, please call or email me at the information below.\n\nSincerely,"
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
    }
  ]' WHERE document_template_code ='NCL';

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
	  "context-value": "This letter serves as formal notice that the Notice of Work and Reclamation application dated "
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
	  "context-value": "for the above noted property has been discontinued for the proposed project."
	},
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Future proposals for mining activities on the above noted property will require the submission of a new Notice of Work application. Should you require further information or have questions please do not hesitate to contact me.",
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
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.fax_number",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_1",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_1",
      "read-only": true
    },
    {
      "id": "rc_office_mailing_address_line_2",
      "required": true,
      "relative-data-path": "mine.region.regional_contact_office.mailing_address_line_2",
      "read-only": true
    },
    {
      "id": "application_type_code",
      "relative-data-path": "now_application.application_type_code",
      "read-only": true
    }
  ]' WHERE document_template_code ='NRL';

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
      "context-value": "Please ensure that you and all persons who are carrying out activities in accordance with this permit comply with all terms and conditions of the permit and are familiar with the permitted work program.\n\nThis permit applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation. Examples of other authorizations would be for timber removal, water use, works within the agricultural land reserve etc.\n\nThe amount of your security deposit may be adjusted on the basis of reclamation performance, field inspections by this ministry, and on reports which may be requested.",
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
      "id": "application_dt_label",
      "type": "LABEL",
	    "context-value": "I am writing to acknowledge receipt of your Notice of Work dated"
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
	    "context-value": "Due to the nature of the proposed work, a Mines Act permit is not required.  I wish you every success in your endeavor.\n\nPlease note that this applies only to the requirements under the Mines Act and Health, Safety and Reclamation Code for Mines in British Columbia (Code).  Other legislation may be applicable to the operation and you may be required to obtain approvals or permits under that legislation.  It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation, including the Wildfire Act and Wildfire Regulation.\nIf your work plans should change and more intensive exploration is anticipated, please submit another Notice of Work providing the appropriate information.\n\nTo clarify or discuss any of the above, please call this office.",
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
  ]' WHERE document_template_code ='NPR';

UPDATE document_template SET form_spec_json = '[]' WHERE document_template_code = 'ESP';
UPDATE document_template SET form_spec_json = '[
      {
      "id": "letter_date",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": "YYYY-MM-DD",
      "context-value": "{DATETIME.UTCNOW}",
      "required": true
    },
    {
      "id": "letter_body_label_0",
      "type": "LABEL",
      "context-value": "Enclosed please find new Explosives Storage and Use Permit <Permit Number> made out to <Permittee> for the storage of explosives/detonators at the <Mine Name> mine site.  "
    },
    {
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Please ensure these copies of the permit and the magazine rules are posted in the magazines.  When the permit is no longer required, if the site conditions under which the permit was issued are no longer valid or upon closure of mining operations, please return the permit to this office for cancellation.",
      "required": true
    },
    {
      "id": "letter_body_label_1",
      "type": "LABEL",
      "context-value": "Thank you.\n\nSincerely,"
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
    }
]' WHERE document_template_code = 'ESL';