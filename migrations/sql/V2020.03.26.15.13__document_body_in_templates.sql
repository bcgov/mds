
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
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Future proposals for mining activities on the above noted property will require the submission of a new Notice of Work application. Should you require further information or have questions please do not hesitate to contact me.",
      "required":true
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
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You will have to reapply should you wish to carry out your intended work program. You are reminded that pursuant to Section 10 of the Mines Act no exploration activities can be carried out unless you have received the required permit.",
      "required":true
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
    },
    { 
      "id": "bond_information_para",
      "label": "Bond Information",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "You may wish to take the opportunity to post your security at this time to avoid delays in the permitting process.  The security deposit amount has been calculated based on the information provided in your application.  Details for the security deposit calculation are outlined in the attached spreadsheet.  Preferred forms of security are certified cheques, money orders or bank drafts made payable to the Minister of Finance.  Surety Bonds and Irrevocable Standby Letters of Credit (‘ILOC’) are also acceptable.  Please do not send cash.  Ensure you also include a completed and signed `No Interest Payable Form`, which is attached.  ILOCs will only be accepted from the following financial institutions: Bank of Montreal, Bank of Nova Scotia, Canadian Imperial Bank of Commerce, Royal Bank of Canada, Toronto-Dominion Bank",
      "required":true
    },
    { 
      "id": "other_documents_para",
      "label": "Other Required Documents",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "In addition, within 30 calendar days of receipt of this letter and prior to issuance of a permit, you must provide to this office:  A Chance Find Procedure (‘CFP’) for archaeological sites, an invasive plant species management plan and an updated Mine Emergency Response Plan (‘MERP’).  Guidelines and best management practices have been attached to this letter to assist with the preparation of the aforementioned items.",
      "required":true
    },
    { 
      "id": "plant_program_para",
      "label": "Alien Plant Program Information",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "The introduction and spread of invasive plants is a concern throughout the area.  The provincial Invasive Alien Plant Program (https://www2.gov.bc.ca/gov/content/environment/plants-animals-ecosystems/invasive-species/iapp) should be reviewed to determine what invasive species have been documented in and around the proposed work site(s).  Best management practices should be applied during operations and an invasive plant management strategy developed.  The attached best practices document has been developed by the Invasive Species Council of British Columbia for forestry operations, but the operational guidelines describe in it can be extended to mineral exploration operations.  For example, ensure incoming and outgoing vehicles are free of weed seeds and plant parts, report observations of infestation and re-vegetate disturbed areas as soon after disturbance.  For more information on individual species visit the Ministry of Agriculture site www.weedsbc.ca or the Invasive Species Council of BC website at www.bcinvasives.ca and go to `resources`.",
      "required":true
    },
    { 
      "id": "merp_para",
      "label": "MERP Information",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "The MERP shall include a section which outlines how engagement with affected communities and First Nations will occur in case of an emergency at your mine site.  The MERP is required to be posted at the work site at all times, which must include the name of the designated Mine Manager.  All employees must be advised and trained in the use of this plan.",
      "required":true
    },
    { 
      "id": "letter_body",
      "label": "Letter Body",
      "type": "AUTO_SIZE_FIELD",
      "context-value": "Other legislation may be applicable to the operation and you (the Permittee) may be required to obtain approvals or permits under that legislation.  It is your responsibility to comply with the terms and conditions of all other permits and authorizations which you may have been issued and other applicable legislation including, but not limited to the: Wildlife Act, Wildfire Act, Wildfire Regulation and the Water Sustainability Act.",
      "required":true
    }
  ]'
where document_template_code = 'NCL';
