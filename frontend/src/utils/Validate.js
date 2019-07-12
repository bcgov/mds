import { memoize } from "lodash";
import moment from "moment";

/**
 * Utility class for validating inputs using redux forms
 */
class Validator {
  ASCII_REGEX = /^[\x0-\x7F\s]*$/;

  CAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

  EMAIL_REGEX = /^[a-zA-Z0-9`'’._%+-]+@[a-zA-Z0-9.-]+$/;

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

export const validateIncidentDate = memoize((reportedDate) => (value) =>
  value <= reportedDate
    ? "Incident date and time cannot occur before reporting occurence."
    : undefined
);

// existingAppointments : PropTypes.arrayOf(CustomPropTypes.partyRelationship)
// newAppt : {start_date : String, end_date : String, party_guid : String}
// apptType : CustomPropTypes.partyRelationshipType
export const validateDateRanges = (existingAppointments, newAppt, apptType) => {
  const errorMessages = {};
  const conflictMsg = (appt) =>
    `Assignment conflicts with existing ${apptType}: ${appt.party.name}`;
  const toDate = (dateString) => (dateString ? moment(dateString, "YYYY-MM-DD").toDate() : null);
  const MAX_DATE = Date.UTC(275760, 9, 12);
  const MIN_DATE = Date.UTC(-271821, 3, 20);

  if (existingAppointments.length === 0) {
    return errorMessages;
  }

  const dateAppointments = existingAppointments.map((appt) => {
    appt.start_date = appt.start_date ? toDate(appt.start_date) : MIN_DATE;
    appt.end_date = appt.end_date ? toDate(appt.end_date) : MAX_DATE;
    return appt;
  });

  const newDateAppt = Object.assign({}, newAppt);
  newDateAppt.start_date = newDateAppt.start_date ? toDate(newDateAppt.start_date) : MIN_DATE;
  newDateAppt.end_date = newDateAppt.end_date ? toDate(newDateAppt.end_date) : MAX_DATE;

  // If (StartA <= EndB) and (EndA >= StartB) ; “Overlap”)
  const conflictingAppointments = dateAppointments.filter(
    (appt) => appt.end_date >= newDateAppt.start_date && appt.start_date <= newDateAppt.end_date
  );

  if (conflictingAppointments.length === 0) {
    return errorMessages;
  }

  const startDateConflict = conflictingAppointments.reduce(
    (conflict, potentialConflict) =>
      newDateAppt.start_date <= potentialConflict.end_date &&
      (!conflict || potentialConflict.start_date < conflict.start_date)
        ? potentialConflict
        : conflict,
    null
  );

  const endDateConflict = conflictingAppointments.reduce(
    (conflict, potentialConflict) =>
      newDateAppt.end_date <= potentialConflict.start_date &&
      (!conflict || potentialConflict.end_date > conflict.end_date)
        ? potentialConflict
        : conflict,
    null
  );

  console.log("End Conflict", JSON.stringify(endDateConflict));

  console.log("Start Conflict", JSON.stringify(startDateConflict));

  if (endDateConflict) errorMessages.end_date = conflictMsg(endDateConflict);
  if (startDateConflict) errorMessages.start_date = conflictMsg(startDateConflict);

  return errorMessages;
};
