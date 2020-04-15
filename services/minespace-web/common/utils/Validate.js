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

  CURRENCY_REGEX = /^\d{1,8}(?:\.\d{0,2})?$/;

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

  checkCurrency(number) {
    return this.CURRENCY_REGEX.test(number);
  }
}

export const Validate = new Validator();

export const required = (value) => (value ? undefined : "This is a required field");

export const requiredRadioButton = (value) =>
  value !== null ? undefined : "This is a required field";

export const requiredList = (value) =>
  value && value.length > 0 ? undefined : "This is a required field";

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

// Redux Forms 'Fields' component accepts an array of Field names, and applies the validation to both field inputs,
// The raw input should be a number, the unit code comes from a dropdown and should be ignored
export const numberWithUnitCode = (value) => {
  const isUnitCode = value && value.length <= 3 && value === value.toUpperCase();
  return value && !isUnitCode && Number.isNaN(Number(value)) ? "Input must be a number" : undefined;
};

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

export const currency = (value) =>
  value && !Validate.checkCurrency(value) ? "Invalid dollar amount" : undefined;

export const validSearchSelection = ({ key, err }) => (value, allValues, formProps) =>
  !Object.keys(formProps[key]).includes(value) ? err || "Invalid Selection" : undefined;

export const validateStartDate = memoize((previousStartDate) => (value) =>
  value <= previousStartDate
    ? "New manager's start date cannot be on or before the previous manager's start date."
    : undefined
);

export const dateNotInFuture = (value) =>
  value && new Date(value) >= new Date() ? "Date cannot be in the future" : undefined;

export const yearNotInFuture = (value) =>
  value && value > new Date().getFullYear() ? "Year cannot be in the future" : undefined;

export const validateIncidentDate = memoize((reportedDate) => (value) =>
  value <= reportedDate
    ? "Incident date and time cannot occur before reporting occurence."
    : undefined
);

export const validateDateRanges = (
  existingAppointments,
  newAppt,
  apptType,
  isCurrentAppointment
) => {
  const errorMessages = {};
  const toDate = (dateString) => (dateString ? moment(dateString, "YYYY-MM-DD").toDate() : null);
  const MAX_DATE = new Date(8640000000000000);
  const MIN_DATE = new Date(-8640000000000000);

  if (existingAppointments.length === 0) {
    return errorMessages;
  }

  const dateAppointments = existingAppointments.map((appt) => {
    const appointment = Object.assign({}, appt);
    appointment.start_date = appt.start_date ? toDate(appt.start_date) : MIN_DATE;
    appointment.end_date = appt.end_date ? toDate(appt.end_date) : MAX_DATE;
    return appointment;
  });

  const newDateAppt = Object.assign({}, newAppt);
  newDateAppt.start_date = newDateAppt.start_date ? toDate(newDateAppt.start_date) : MIN_DATE;
  newDateAppt.end_date = newDateAppt.end_date ? toDate(newDateAppt.end_date) : MAX_DATE;
  let conflictingAppointments;

  if (isCurrentAppointment) {
    conflictingAppointments = dateAppointments.filter(
      (appt) => newDateAppt.start_date <= appt.start_date
    );
  } else {
    // If (NewApptEnd >= ApptStart) and (NewApptStart <= ApptEnd) ; “Overlap”)
    conflictingAppointments = dateAppointments.filter(
      (appt) => newDateAppt.end_date >= appt.start_date && newDateAppt.start_date <= appt.end_date
    );
  }
  if (conflictingAppointments.length > 0) {
    const conflictMsg = `Assignment conflicts with existing ${apptType}s: ${conflictingAppointments
      .map((appt) => appt.party.name)
      .join()}`;
    errorMessages.start_date = conflictMsg;
    errorMessages.end_date = conflictMsg;
  }

  return errorMessages;
};
