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

// This method sorts codes of the for '#.#.# - Lorem Ipsum'
// where the numbe of numbers is variable and the text is optional
// TODO: In order to sort incidents this will need to be modified to deal with
// parentheses
export const compareCodes = (a, b) => {
  const a_number = a.split(" - ", 1)[0];
  const b_number = b.split(" - ", 1)[0];
  const a_array = a_number.split(".");
  const b_array = b_number.split(".");
  const k = Math.min(a_array.length, b_array.length);
  for (let i = 0; i < k; i += 1) {
    a_array[i] = parseInt(a_array[i], 10);
    b_array[i] = parseInt(b_array[i], 10);
    if (a_array[i] > b_array[i]) return 1;
    if (a_array[i] < b_array[i]) return -1;
  }
  if (a_array.length === b_array.length) {
    return 0;
  }
  return a_array.length < b_array.length ? -1 : 1;
};

export const codeSorter = (code_one, code_two) => {
  // if a code is null it set before one that is not in sort order.
  if (!code_one) {
    return true;
  }
  if (!code_two) {
    return false;
  }
  if (compareCodes(code_one, code_two) < 0) {
    return true;
  }
  return false;
};
