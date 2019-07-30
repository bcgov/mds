import moment from "moment";
import { reset } from "redux-form";
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
export const resetForm = (form) => (result, dispatch, props) =>
  props.clearOnSubmit && dispatch(reset(form));

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

export const formatPostalCode = (code) => code && code.replace(/.{3}$/, " $&");

export const formatTitleString = (input) =>
  input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

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

export const formatComplianceCodeValueOrLabel = (code, showDescription) => {
  const { section, sub_section, paragraph, sub_paragraph, description } = code;
  const formattedSubSection = sub_section ? `.${sub_section}` : "";
  const formattedParagraph = paragraph ? `.${paragraph}` : "";
  const formattedSubParagraph = sub_paragraph !== null ? `.${sub_paragraph}` : "";
  const formattedDescription = showDescription ? ` - ${description}` : "";

  return `${section}${formattedSubSection}${formattedParagraph}${formattedSubParagraph}${formattedDescription}`;
};
