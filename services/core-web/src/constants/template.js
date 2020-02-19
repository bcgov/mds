// name: Rejection Letter
// code: RJL
// fields: <array of Field objects>
class Template {
  constructor(name, code, fields) {
    this.name = name;
    this.code = code;
    this.fields = fields;
  }
}

// label: Mine Name
// code: <<mine name>> (or what ever Carbone uses to identify this field)
// inputType: <the input type, i.e., the 'render config' type (see config.js)>
// placeholder: Enter your mine name
// value: <pre-existing value, if it exists>
class Field {
  constructor(code, label, inputType, inputProps) {
    this.code = code;
    this.label = label;
    this.inputType = inputType;
    this.inputProps = inputProps;
  }
}

const FIELDS_REJECTION_LETTER = [
  new Field("<<date>>", "Date", "DATE", null),
  new Field("<<mine_no>>", "Mine Number", "FIELD", null),
  new Field("<<addy1>>", "Address 1", "FIELD", null),
  new Field("<<addy>>", "Address", "FIELD", null),
  new Field("<<property>>", "Property", "FIELD", null),
  new Field("<<apl_dt>>", "Application Date", "DATE", null),
  new Field("<<inspector>>", "Inspector", "FIELD", null),
];

const TEMPLATE_REJECTION_LETTER = new Template("Rejection Letter", "RJL", FIELDS_REJECTION_LETTER);

// The templates, hard-coded for now. Data should be retrieved from DB then we use that data
// to create these template objects which the front-end uses.
export const TEMPLATES = { RJL: TEMPLATE_REJECTION_LETTER };

export default TEMPLATES;
