
ALTER TABLE document_template ADD COLUMN source_model_name varchar NOT NULL DEFAULT 'NOWApplicationIdentity'; 
ALTER TABLE document_template ALTER COLUMN source_model_name DROP NOT NULL; 



UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s name",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
      "required": true,
      "relative-data-path": "now_application.submitted_date"
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
    }
  ]' 
where document_template_code = 'NRL';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s name",
      "required": false
    },
    {
      "id": "property",
      "label": "Property",
      "type": "FIELD",
      "placeholder": "Enter the property",
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "withdrawal_dt",
      "label": "Withdrawal Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "inspector",
      "label": "Inspector",
      "type": "FIELD",
      "placeholder": "Enter the inspector''s name",
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
    }
  ]'
where document_template_code = 'NWL';

UPDATE document_template SET form_spec_json = '[
    {
      "id": "letter_dt",
      "label": "Letter Date",
      "type": "DATE",
      "placeholder": null,
      "required": true
    },
    {
      "id": "mine_no",
      "label": "Mine Number",
      "type": "FIELD",
      "placeholder": "Enter the mine number",
      "required": true,
      "relative-data-path": "mine.mine_no",
      "read-only": true
    },
    {
      "id": "proponent_address",
      "label": "Proponent Address",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s address",
      "required": true
    },
    {
      "id": "proponent_name",
      "label": "Proponent Name",
      "type": "FIELD",
      "placeholder": "Enter the propnent''s name",
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
      "required": true,
      "relative-data-path": "now_application.property_name",
      "read-only": true
    },
    {
      "id": "application_dt",
      "label": "Application Date",
      "type": "DATE",
      "placeholder": null,
      "required": true,
      "relative-data-path": "now_application.submitted_date"
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
      "required": true,
      "relative-data-path": "now_application.lead_inspector.name"
    }
  ]'
where document_template_code = 'NCL';
