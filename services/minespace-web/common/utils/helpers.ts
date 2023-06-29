import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  CONSEQUENCE_CLASSIFICATION_RANK_HASH,
  DATETIME_TZ_FORMAT,
  DEFAULT_TIMEZONE,
} from "@common/constants/strings";
import { get, isEmpty, isNil, sortBy } from "lodash";
import { createNumberMask } from "redux-form-input-masks";
/* eslint-disable */
import moment from "moment-timezone";
import { reset } from "redux-form";
import { ItemMap } from "@mds/common";

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
export const createItemMap = <T>(array: T[], idField: string): ItemMap<T> => {
  const mapping: ItemMap<T> = {};
  // NOTE: Implementation chosen for performance
  // Please do not refactor to use immutable data
  array.forEach((item) => {
    mapping[item[idField]] = item;
  });
  return mapping;
};

// Function create id array for redux state. (used in src/reducers/<customReducer>)
export const createItemIdsArray = (array, idField) => array.map((item) => item[idField]);

export const createDropDownList = (
  array,
  labelField,
  valueField,
  isActiveField = false,
  subType = null,
  labelFormatter = null,
  orderByAlphabetically = true
) => {
  const options = array.map((item) => ({
    value: item[valueField],
    label: labelFormatter ? labelFormatter(item[labelField]) : item[labelField],
    // @ts-ignore
    isActive: isActiveField ? item[isActiveField] : true,
    subType: subType ? item[subType] : null,
  }));

  return sortBy(options, [
    (o) => {
      return orderByAlphabetically ? o.label : options;
    },
  ]);
};

// Function to create a hash given an array of values and labels
export const createLabelHash = (arr) =>
  arr.reduce((map, { value, label }) => ({ [value]: label, ...map }), {});

// Function to format an API date string to human readable
export const formatDate = (dateString) =>
  dateString && dateString !== "None" && moment(dateString, "YYYY-MM-DD").format("MMM DD YYYY");

export const formatTime = (timeStamp) => timeStamp && moment(timeStamp).format("h:mm a");

export const formatDateTime = (dateTime) => dateTime && moment(dateTime).format("lll");

export const formatDateTimeTz = (
  dateTime: Date | string,
  timezone: string = DEFAULT_TIMEZONE
): string =>
  moment(dateTime, true).isValid() && moment.tz(dateTime, timezone).format(DATETIME_TZ_FORMAT);

export const timeAgo = (dateTime, unit = "day") => {
  const startDate = dateTime;
  const endDate = new Date().toUTCString();

  if (unit === "day") {
    return moment(endDate).diff(moment(startDate), "days");
  } else if (unit === "hours") {
    return moment(endDate).diff(moment(startDate), "hours");
  } else if (unit === "minutes") {
    return moment(endDate).diff(moment(startDate), "minutes");
  } else {
    return moment(endDate).diff(moment(startDate), "seconds");
  }
};

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
  allowNegative: true,
});

export const wholeNumberMask = createNumberMask({
  decimalPlaces: 0,
  locale: "en-CA",
  allowEmpty: true,
  stringValue: false,
  allowNegative: false,
});

export const isDateRangeValid = (start, end) => {
  const duration = moment.duration(moment(end).diff(moment(start)));
  const milliseconds = duration.asMilliseconds();
  return Math.sign(milliseconds) !== -1;
};

export const dateSorter = (key: string) => (a: any, b: any) => {
  if (a[key] === b[key]) {
    return 0;
  }
  if (!a[key]) {
    return 1;
  }
  if (!b[key]) {
    return -1;
  }
  return moment(a[key]).diff(moment(b[key]));
};

export const nullableStringSorter = (path) => (a, b) => {
  const aObj = get(a, path, null);
  const bObj = get(b, path, null);
  if (aObj === bObj) {
    return 0;
  }
  if (!aObj) {
    return 1;
  }
  if (!bObj) {
    return -1;
  }
  return aObj.localeCompare(bObj);
};

export const sortListObjectsByPropertyLocaleCompare = (list, property) =>
  list.sort(nullableStringSorter(property));

export const sortListObjectsByPropertyDate = (list, property) => list.sort(dateSorter(property));

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

export const normalizeExt = (value) => (value ? value.slice(0, 6) : value);

export const normalizeDatetime = (value) => moment(value).toISOString();

export const upperCase = (value) => value && value.toUpperCase();

export const truncateFilename = (filename = "", max = 40) => {
  if (!filename || filename.length <= max) {
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
const _flattenObject = (ob, isArrayItem = false) => {
  const toReturn = {};
  let flatObject: any = {};
  for (const i in ob) {
    if (typeof ob[i] === "object") {
      flatObject = _flattenObject(ob[i], Array.isArray(ob[i]));
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[(isArrayItem ? `[${i}]` : i) + (isNaN(Number(x)) ? `.${x}` : "")] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

const clean = (obj) => {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
};

const normalizeFlattenedArrayProperties = (obj) => {
  for (var propName in obj) {
    if (propName.includes(".[")) {
      const newKey = propName.replace(".[", "[");
      Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, propName));
      delete obj[propName];
    }
    if (propName) propName.replace(".[", "[");
  }
};

export const flattenObject = (ob) => {
  const obj = _flattenObject(ob);
  if (!isEmpty(obj)) {
    clean(obj);

    // check if object is not an empty object after cleaning
    if (!isEmpty(obj)) {
      normalizeFlattenedArrayProperties(obj);
    }
  }

  return obj;
};

export const formatMoney = (value) => {
  const number = Number(value);
  return isNaN(number)
    ? null
    : number.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

export const renderLabel = (options, keyStr) =>
  options && options.length > 0 && keyStr && keyStr.trim().length > 0
    ? options.find((item) => item.value === keyStr).label
    : "";

export const getDurationText = (startDate, endDate) => {
  const duration = moment.duration(moment(endDate).diff(moment(startDate)));
  const milliseconds = duration.asMilliseconds();
  if (Math.sign(milliseconds) === -1) {
    return "Invalid - End Date precedes Start Date";
  }
  const years = duration.years();
  const months = duration.months();
  const weeks = duration.weeks();
  const days = duration.subtract(weeks, "w").days();

  const yearsText = getDurationTextOrDefault(years, "Year");
  const monthsText = getDurationTextOrDefault(months, "Month");
  const weeksText = getDurationTextOrDefault(weeks, "Week");
  const daysText = getDurationTextOrDefault(days, "Day");

  return `${yearsText} ${monthsText} ${weeksText} ${daysText}`;
};

export const getDurationTextInDays = (duration) => {
  if (Math.sign(duration._milliseconds) === -1) {
    return "N/A";
  }
  const years = duration.years();
  const months = duration.months();
  const days = duration.days();

  const yearsText = getDurationTextOrDefault(years, "Year");
  const monthsText = getDurationTextOrDefault(months, "Month");
  const daysText = getDurationTextOrDefault(days, "Day");

  return `${yearsText} ${monthsText} ${daysText}`;
};

const getDurationTextOrDefault = (duration, unit) => {
  if (duration <= 0) {
    return "";
  }
  unit = duration === 1 ? unit : unit + "s";
  return `${duration} ${unit}`;
};

// Application fees are valid if they remain in the same fee bracket || they fall into the lower bracket
// Fees need to be readjusted if they move to a higher bracket only
export const isPlacerAdjustmentFeeValid = (
  proposed = 0,
  adjusted = 0,
  proposedStartDate,
  proposedEndDate
) => {
  let isFeeValid = true;

  const duration = moment.duration(moment(proposedStartDate).diff(moment(proposedEndDate)));
  const isExactlyFiveOrUnder =
    (duration.years() === 5 &&
      duration.months() === 0 &&
      duration.weeks() === 0 &&
      duration.days() === 0) ||
    duration.years() < 5;

  if (isExactlyFiveOrUnder) {
    if (proposed < 60000) {
      isFeeValid = adjusted < 60000;
    } else if (proposed >= 60000 && proposed < 125000) {
      isFeeValid = adjusted < 125000;
    } else if (proposed >= 125000 && proposed < 250000) {
      isFeeValid = adjusted < 250000;
    } else if (proposed >= 250000 && proposed < 500000) {
      isFeeValid = adjusted < 500000;
    } else {
      // Anything above 500,000 is valid as the applicant already paid the max fee.
      isFeeValid = true;
    }
  } else if (proposed < 10000) {
    isFeeValid = adjusted < 10000;
  } else if (proposed >= 10000 && proposed < 60000) {
    isFeeValid = adjusted < 60000;
  } else if (proposed >= 60000 && proposed < 125000) {
    isFeeValid = adjusted < 125000;
  } else if (proposed >= 125000 && proposed < 250000) {
    isFeeValid = adjusted < 250000;
  } else {
    // Anything above 250,000 is valid as the applicant already paid the max fee.
    isFeeValid = true;
  }
  return isFeeValid;
};

export const isPitsQuarriesAdjustmentFeeValid = (proposed = 0, adjusted = 0) => {
  let isFeeValid = true;
  if (proposed < 5000) {
    isFeeValid = adjusted < 5000;
  } else if (proposed >= 5000 && proposed < 10000) {
    isFeeValid = adjusted < 10000;
  } else if (proposed >= 10000 && proposed < 20000) {
    isFeeValid = adjusted < 20000;
  } else if (proposed >= 20000 && proposed < 30000) {
    isFeeValid = adjusted < 30000;
  } else if (proposed >= 30000 && proposed < 40000) {
    isFeeValid = adjusted < 40000;
  } else if (proposed >= 40000 && proposed < 50000) {
    isFeeValid = adjusted < 50000;
  } else if (proposed >= 50000 && proposed < 60000) {
    isFeeValid = adjusted < 60000;
  } else if (proposed >= 60000 && proposed < 70000) {
    isFeeValid = adjusted < 70000;
  } else if (proposed >= 70000 && proposed < 80000) {
    isFeeValid = adjusted < 80000;
  } else if (proposed >= 80000 && proposed < 90000) {
    isFeeValid = adjusted < 90000;
  } else if (proposed >= 90000 && proposed < 100000) {
    isFeeValid = adjusted < 100000;
  } else if (proposed >= 100000 && proposed < 130000) {
    isFeeValid = adjusted < 130000;
  } else if (proposed >= 130000 && proposed < 170000) {
    isFeeValid = adjusted < 170000;
  }
  // Anything above 170,000 is valid as the applicant already paid the max fee.
  return isFeeValid;
};

export const determineExemptionFeeStatus = (
  permitStatus,
  permitPrefix,
  tenure,
  isExploration = null,
  disturbance = []
) => {
  let exemptionStatus;
  if ((permitPrefix === "P" && tenure === "PLR") || permitStatus === "C") {
    exemptionStatus = "Y";
  } else if (isExploration && disturbance.length === 1 && disturbance.includes("SUR")) {
    exemptionStatus = "Y";
  } else if (
    (permitPrefix === "M" || permitPrefix === "C") &&
    (tenure === "MIN" || tenure === "COL")
  ) {
    exemptionStatus = "MIM";
  } else if (
    (permitPrefix === "Q" || permitPrefix === "G") &&
    (tenure === "BCL" || tenure === "MIN" || tenure === "PRL")
  ) {
    exemptionStatus = "MIP";
  }
  return exemptionStatus;
};

export const highlightPermitConditionVariables = () => {
  const regEX = /{(.*?)}/;

  return regEX;
};

export const formatBooleanToString = (value, defaultValue) => {
  let response;
  if (isNil(value)) {
    response = defaultValue;
  } else {
    response = value ? "Yes" : "No";
  }
  return response;
};

export const formatUrlToUpperCaseString = (url) => {
  const stopWords = ["what", "which", "who", "and", "but"];
  let urlArr = url.split("-");
  return urlArr
    .map((word) => {
      return stopWords.includes(word) ? [word] : word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export const cleanFilePondFile = () => {
  const fileUploaded: any = document.getElementsByClassName(
    "filepond--action-revert-item-processing"
  );
  if (fileUploaded.length > 0) {
    fileUploaded.forEach((file) => file.click());
  }
};

/**
 *  @param tsf: A complete tailings storage facility object
 *  This function checks the consequence classification for the tsf and it's child dams, and then returns
 *  the text for the highest consequence entry to be displayed.
 *  **/
export const getHighestConsequence = (tsf) => {
  if (!tsf.dams || tsf.dams.length <= 0) {
    return CONSEQUENCE_CLASSIFICATION_CODE_HASH[tsf.consequence_classification_status_code];
  }

  const highestRankedDam = tsf.dams.reduce((prev, current) =>
    CONSEQUENCE_CLASSIFICATION_RANK_HASH[prev.consequence_classification] >
    CONSEQUENCE_CLASSIFICATION_RANK_HASH[current.consequence_classification]
      ? prev
      : current
  );
  return CONSEQUENCE_CLASSIFICATION_RANK_HASH[highestRankedDam.consequence_classification] >
    CONSEQUENCE_CLASSIFICATION_RANK_HASH[tsf.consequence_classification_status_code]
    ? CONSEQUENCE_CLASSIFICATION_CODE_HASH[highestRankedDam.consequence_classification]
    : CONSEQUENCE_CLASSIFICATION_CODE_HASH[tsf.consequence_classification_status_code];
};
