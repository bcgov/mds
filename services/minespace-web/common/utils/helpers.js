/* eslint-disable */
import moment from "moment";
import { reset } from "redux-form";
import { createNumberMask } from "redux-form-input-masks";

/**
 * Helper function to clear redux form after submission
 *
 * Usage:
 *  export default (reduxForm({
    form: formName,
    onSubmitSuccess: resetForm(formName),
  })(Component)
  );
 *
 */
export const resetForm = (form) => (result, dispatch) => dispatch(reset(form));

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};
// Function to create state object using the id as the key (used in src/reducers/<customReducer>)
export const createItemMap = (array, idField) => {
  const mapping = {};
  // NOTE: Implementation chosen for performance
  // Please do not refactor to use immutable data
  array.forEach((item) => {
    mapping[item[idField]] = item;
  });
  return mapping;
};

// Function create id array for redux state. (used in src/reducers/<customReducer>)
export const createItemIdsArray = (array, idField) => array.map((item) => item[idField]);

export const createDropDownList = (array, labelField, valueField) =>
  array.map((item) => ({ value: item[valueField], label: item[labelField] }));

// Function to create a hash given an array of values and labels
export const createLabelHash = (arr) =>
  arr.reduce((map, { value, label }) => ({ [value]: label, ...map }), {});

// Function to format an API date string to human readable
export const formatDate = (dateString) =>
  dateString && dateString !== "None" && moment(dateString, "YYYY-MM-DD").format("MMM DD YYYY");

export const formatTime = (timeStamp) => timeStamp && moment(timeStamp).format("h:mm a");

export const formatDateTime = (dateTime) => dateTime && moment(dateTime).format("lll");

export const formatPostalCode = (code) => code && code.replace(/.{3}$/, " $&");

export const formatTitleString = (input) =>
  input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const currencyMask = createNumberMask({
  prefix: "$",
  suffix: "",
  decimalPlaces: 2,
  locale: "en-CA",
  allowEmpty: true,
  stringValue: false,
});

export const dateSorter = (key) => (a, b) => {
  if (a[key] === b[key]) {
    return 0;
  }
  if (!a[key]) {
    return 1;
  }
  if (!b[key]) {
    return -1;
  }
  return moment(a[key]) - moment(b[key]);
};

export const nullableStringSorter = (key) => (a, b) => {
  if (a[key] === b[key]) {
    return 0;
  }
  if (!a[key]) {
    return 1;
  }
  if (!b[key]) {
    return -1;
  }
  return a[key].localeCompare(b[key]);
};

// Case insensitive filter for a SELECT field by label string
export const caseInsensitiveLabelFilter = (input, option) =>
  option.props.children.toLowerCase().includes(input.toLowerCase());

// function taken directly from redux-forms (https://redux-form.com/6.0.0-rc.1/examples/normalizing)
// automatically adds dashes to phone number
export const normalizePhone = (value, previousValue) => {
  if (!value) {
    return value;
  }
  const onlyNums = value.replace(/[^\d]/g, "");
  if (!previousValue || value.length > previousValue.length) {
    // typing forward
    if (onlyNums.length === 3) {
      return `${onlyNums}-`;
    }
    if (onlyNums.length === 6) {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}-`;
    }
  }
  if (onlyNums.length <= 3) {
    return onlyNums;
  }
  if (onlyNums.length <= 6) {
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
  }
  return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 6)}-${onlyNums.slice(6, 10)}`;
};

export const upperCase = (value) => value && value.toUpperCase();

export const truncateFilename = (filename, max = 40) => {
  if (filename.length <= max) {
    return filename;
  }

  // String to use to represent that a string has been truncated
  const trunc = "[...]";

  // Extract the parts (name and extension) of the filename
  const parts = /(^.+)\.([^.]+)$/.exec(filename);

  // If the filename has no extension (e.g., the filename is "foo", not "foo.txt")
  if (!parts) {
    return `${filename.substring(0, max)}${trunc}`;
  }

  // Get the name of the filename (e.g., "foo.txt" will give "foo")
  const name = parts[1].length > max ? `${parts[1].substring(0, max)}${trunc}` : parts[1];

  // Get the extension of the filename (e.g., "foo.txt" will give "txt")
  // Extensions can be very long too, so limit their length as well
  const extMax = 5;
  const ext = parts[2].length > extMax ? `${parts[2].substring(0, extMax)}${trunc}` : parts[2];

  // Return the formatted shortened version of the filename
  return `${name}.${ext}`;
};

export const getFiscalYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const fiscalYear = new Date(currentYear, 3, 1);
  if (today > fiscalYear) {
    return currentYear;
  }
  return currentYear - 1;
};

export const formatParamStringToArray = (param) => (param ? param.split(",").filter((x) => x) : []);

// Used for parsing/stringifying list query params.
// method :: String enum[split, join]
// listFields :: Array of Strings matching the list query params. ex. ['mine_region']
// fields :: Object created by queryString.parse()
export const formatQueryListParams = (method, listFields) => (fields) => {
  const params = Object.assign({}, fields);
  listFields.forEach((listField) => {
    params[listField] = fields[listField] ? fields[listField][method](",") : undefined;
  });
  return params;
};

// Adapt our { label, value } options arrays to work with AntDesign column filter
export const optionsFilterLabelAndValue = (options) =>
  options.map(({ label, value }) => ({ text: label, value }));

// Adapt our { label, value } options arrays to work with AntDesign column filter (value is label)
export const optionsFilterLabelOnly = (options) =>
  options.map(({ label }) => ({ text: label, value: label }));

// This method sorts codes of the for '#.#.# - Lorem Ipsum'
// where the number of integers is variable and the text is optional
export const compareCodes = (a, b) => {
  // Null codes are sorted before non-null codes
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  // Returns the first match that is non-null.
  const regexParse = (input) =>
    input.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.\(([0-9]+)/) ||
    input.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/) ||
    input.match(/([0-9]+)\.([0-9]+)/) ||
    input.match(/([0-9]+)/);
  const aCodes = regexParse(a.toString());
  const bCodes = regexParse(b.toString());
  if (!aCodes) {
    return -1;
  }
  if (!bCodes) {
    return 1;
  }
  const k = Math.min(aCodes.length, bCodes.length);
  // Compares the non-null parts of two strings of potentially different lengths (e.g 1.11 and 1.4.12)
  for (let i = 1; i < k; i += 1) {
    const aInt = Number(aCodes[i]);
    const bInt = Number(bCodes[i]);
    if (aInt > bInt) {
      return 1;
    }
    if (aInt < bInt) {
      return -1;
    }
  }
  // This line is only reached if all non-null code sections match (e.g 1.11 and 1.11.4)
  // if both codes have the same length then they must be the same code.
  if (aCodes.length === bCodes.length) {
    return 0;
  }
  // The shorter of two codes with otherwise matching numbers is sorted before the longer one.
  // since null is sorted before non-null (e.g 1.11 is before 1.11.12)
  return aCodes.length < bCodes.length ? -1 : 1;
};

export const formatComplianceCodeValueOrLabel = (code, showDescription) => {
  const { section, sub_section, paragraph, sub_paragraph, description } = code;
  const formattedSubSection = sub_section ? `.${sub_section}` : "";
  const formattedParagraph = paragraph ? `.${paragraph}` : "";
  const formattedSubParagraph = sub_paragraph !== null ? `.${sub_paragraph}` : "";
  const formattedDescription = showDescription ? ` - ${description}` : "";

  return `${section}${formattedSubSection}${formattedParagraph}${formattedSubParagraph}${formattedDescription}`;
};

// function to flatten an object for nested items in redux form
// eslint-disable-snippets
export const flattenObject = (ob) => {
  const toReturn = {};
  let flatObject;
  for (const i in ob) {
    if (typeof ob[i] === "object") {
      flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[i + (isNaN(x) ? `.${x}` : "")] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

export const formatMoney = (value) => {
  const number = Number(value);
  return isNaN(number)
    ? null
    : number.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
