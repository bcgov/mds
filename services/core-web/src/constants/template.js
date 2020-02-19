// Template object property examples:
// name: Rejection Letter
// code: RJL
// fields: <array of Field objects>
class Template {
  constructor(data) {
    this.name = data.name;
    this.code = data.code;
    this.fields = data.fields;
  }
}

// Field object property examples:
// id: address_1 (or what ever Carbone uses to identify this field)
// label: Address
// type: FIELD (the input type, i.e., the 'render config' type (see config.js))
// placeholder: Enter the address
// required: true (whether or not the field is required in order to submit the form)
class Field {
  constructor(data) {
    this.id = data.id;
    this.label = data.label;
    this.type = data.type;
    this.placeholder = data.placeholder;
    this.required = data.required;
  }
}

const fieldsDataRejectionLetter = [
  { id: "date", label: "Date", type: "DATE", placeholder: null, required: true },
  {
    id: "mine_no",
    label: "Mine Number",
    type: "FIELD",
    placeholder: "Enter the mine number",
    required: true,
  },
  {
    id: "addy1",
    label: "Address 1",
    type: "FIELD",
    placeholder: "Enter the address",
    required: true,
  },
  {
    id: "addy",
    label: "Address",
    type: "FIELD",
    placeholder: "Enter the address",
    required: false,
  },
  {
    id: "property",
    label: "Property",
    type: "FIELD",
    placeholder: "Enter the property name",
    required: true,
  },
  {
    id: "apl_dt",
    label: "Application Date",
    type: "DATE",
    placeholder: null,
    required: true,
  },
  {
    id: "inspector",
    label: "Inspector",
    type: "SELECT",
    placeholder: "Select the inspector",
    required: false,
  },
];

const fieldsRejectionLetter = fieldsDataRejectionLetter.map((fieldData) => new Field(fieldData));

const templateDataRejectionLetter = {
  name: "Rejection Letter",
  code: "RJL",
  fields: fieldsRejectionLetter,
};

const TEMPLATE_REJECTION_LETTER = new Template(templateDataRejectionLetter);

// The document templates (hard-coded for now). Data should be retrieved from the DB, then we use that data
// to create the document template objects.
export const TEMPLATES = { [TEMPLATE_REJECTION_LETTER.code]: TEMPLATE_REJECTION_LETTER };

export default TEMPLATES;
