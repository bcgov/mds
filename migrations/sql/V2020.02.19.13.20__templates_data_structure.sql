

CREATE TABLE IF NOT EXISTS document_template (
  document_template_code varchar PRIMARY KEY,
  form_spec_json varchar NOT NULL,
  active_ind boolean DEFAULT true NOT NULL,
  create_user varchar NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user varchar NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE document_template OWNER TO mds;
COMMENT ON TABLE document_template IS 'Holds template data for documents that CORE can generate';


ALTER TABLE now_application_document_type ADD COLUMN document_template_code varchar; 
ALTER TABLE now_application_document_type
    ADD CONSTRAINT now_application_document_type_template_code
    FOREIGN KEY (document_template_code) REFERENCES document_template(document_template_code) ON UPDATE CASCADE ON DELETE SET NULL;


INSERT INTO document_template
(document_template_code,form_spec_json, active_ind, create_user, update_user)
VALUES
	('NOW-RJL', '[
    {
      "id": "date",
      "label": "Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true
    },
    {
      "id": "addy1",
      "label": "Address 1",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": true
    },
    {
      "id": "addy",
      "label": "Address",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true
    },
    {
      "id": "apl_date",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true
    }
  ]', true, 'system-mds', 'system-mds'),
	('NOW-WDL', '[
    {
      "id": "let_dt",
      "label": "Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "file_no",
      "label": "File Number",
      "type": "FIELD",
      "placeholder": "Enter the file number",
      "required": true
    },
    {
      "id": "addy1",
      "label": "Address 1",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": true
    },
    {
      "id": "addy",
      "label": "Address",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true
    },
    {
      "id": "rej_dt",
      "label": "Rejection Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true
    }
  ]', true, 'system-mds', 'system-mds'),
	('NOW-CAL', '[
    {
      "id": "date",
      "label": "Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true
    },
    {
      "id": "addy1",
      "label": "Address 1",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": true
    },
    {
      "id": "addy",
      "label": "Address",
      "type": "FIELD",
      "placeholder": "Enter the address",
      "required": false
    },
    {
      "id": "emailed_to",
      "label": "Emailed to",
      "type": "FIELD",
      "placeholder": "Enter the name of the email recipient",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true
    },
    {
      "id": "apl_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "exploration_type",
      "label": "Exploration Type",
      "type": "FIELD",
      "placeholder": "Enter the exploration type",
      "required": true
    },
    {
      "id": "bond_inc_amt",
      "label": "Bond Amount",
      "type": "FIELD",
      "placeholder": "Enter the bond amount",
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true
    }
  ]', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

UPDATE now_application_document_type
SET document_template_code = 'NOW-CAL'
where now_application_document_type_code = 'CAL';

UPDATE now_application_document_type
SET document_template_code = 'NOW-WDL'
where now_application_document_type_code = 'WDL';

UPDATE now_application_document_type
SET document_template_code = 'NOW-RJL'
where now_application_document_type_code = 'RJL';