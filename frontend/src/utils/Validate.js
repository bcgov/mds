import { memoize } from "lodash";
import moment from "moment";

/**
 * Utility class for validating inputs using redux forms
 */
class Validator {
  ASCII_REGEX = /^[\x0-\x7F\s]*$/;

  CAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

  EMAIL_REGEX = /^[a-zA-Z0-9`'’._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  PHONE_REGEX = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/i;

  NAME_REGEX = /^[A-Za-zÀ-ÿ'\-\s']+$/;

  FLOATS_REGEX = /^-?\d*(\.{1}\d+)?$/;

  NUMBERS_OR_EMPTY_STRING_REGEX = /^-?\d*\.?\d*$/;

  URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

  LAT_REGEX = /^(\+|-)?(?:90(?:(?:\.0{1,7})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,7})?))$/;

  LON_REGEX = /^(\+|-)?(?:180(?:(?:\.0{1,7})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,7})?))$/;

  checkLat(lat) {
    return this.LAT_REGEX.test(lat);
  }

  checkLon(lon) {
    return this.LON_REGEX.test(lon);
  }

  checkPhone(number) {
    return this.PHONE_REGEX.test(number);
  }

  checkEmail(email) {
    return this.EMAIL_REGEX.test(email);
  }

  checkPostalCode(code) {
    return this.CAN_POSTAL_CODE_REGEX.test(code);
  }
}

export const Validate = new Validator();

export const required = (value) => (value ? undefined : "This is a required field");

export const notnone = (value) => (value === "None" ? "Please select an item" : undefined);

export const maxLength = memoize((max) => (value) =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined
);

export const minLength = memoize((min) => (value) =>
  value && value.length < min ? `Must be ${min} characters or more` : undefined
);

export const exactLength = memoize((min) => (value) =>
  value && value.length !== min ? `Must be ${min} characters long` : undefined
);

export const number = (value) =>
  value && Number.isNaN(Number(value)) ? "Input must be a number" : undefined;

export const lat = (value) =>
  value && !Validate.checkLat(value) ? "Invalid latitude coordinate e.g. 53.7267" : undefined;

export const lon = (value) =>
  value && !Validate.checkLon(value) ? "Invalid longitude coordinate e.g. -127.6476000" : undefined;

export const phoneNumber = (value) =>
  value && !Validate.checkPhone(value) ? "Invalid phone number e.g. xxx-xxx-xxxx" : undefined;

export const postalCode = (value) =>
  value && !Validate.checkPostalCode(value) ? "Invalid postal code e.g. X1X1X1" : undefined;

export const email = (value) =>
  value && !Validate.checkEmail(value) ? "Invalid email address" : undefined;

export const validSearchSelection = ({ key, err }) => (value, allValues, formProps) =>
  !Object.keys(formProps[key]).includes(value) ? err || "Invalid Selection" : undefined;

export const validateStartDate = memoize((previousStartDate) => (value) =>
  value <= previousStartDate
    ? "New manager's start date cannot be on or before the previous manager's start date."
    : undefined
);

export const dateNotInFuture = (value) =>
  value && new Date(value) >= new Date() ? "Date can not be in the future" : undefined;

// existingAppointments : PropTypes.arrayOf(CustomPropTypes.partyRelationship)
// newAppt : {start_date : String, end_date : String, party_guid : String}
// apptType : CustomPropTypes.partyRelationshipType
export const validateDateRanges = (existingAppointments, newAppt, apptType) => {
  const errorMessages = {};
  if (existingAppointments.length === 0) {
    return errorMessages;
  }

  const toDate = (dateString) => moment(dateString, "YYYY-MM-DD").toDate();
  const allAppointments = [...existingAppointments, newAppt].sort((a, b) =>
    toDate(a.start_date) > toDate(b.start_date) ? 1 : -1
  );

  for (let i = 0; i < allAppointments.length - 1; i += 1) {
    const current = allAppointments[i];
    const next = allAppointments[i + 1];

    const conflictingParty =
      current.party_guid !== newAppt.party_guid ? current.party.name : next.party.name;
    const conflictingField = current.party_guid === newAppt.party_guid ? "end_date" : "start_date";
    const msg = `Assignment conflicts with existing ${apptType}: ${conflictingParty}`;
    const infiniteStartEnd =
      existingAppointments.length > 0 && !newAppt.start_date && !newAppt.end_date;

    if (
      current.end_date >= next.start_date ||
      // null indicates infinitely into the past/future
      current.end_date === null ||
      next.start_date === null ||
      infiniteStartEnd
    ) {
      errorMessages[conflictingField] = msg;
    }
  }

  return errorMessages;
};
