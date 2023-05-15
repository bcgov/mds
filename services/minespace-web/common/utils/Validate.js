import * as Strings from "@common/constants/strings";

import { memoize } from "lodash";
import moment from "moment";

/**
 * Utility class for validating inputs using redux forms
 */
class Validator {
  ASCII_REGEX = /^[\x0-\x7F\s]*$/;

  CAN_POSTAL_CODE_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/;

  US_POSTAL_CODE_REGEX = /(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/;

  EMAIL_REGEX = /^[a-zA-Z0-9`'’._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  PHONE_REGEX = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/i;

  NAME_REGEX = /^[A-Za-zÀ-ÿ'\-\s']+$/;

  FLOATS_REGEX = /^-?\d*(\.{1}\d+)?$/;

  NUMBERS_OR_EMPTY_STRING_REGEX = /^-?\d*\.?\d*$/;

  URL_REGEX =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

  LAT_REGEX = /^(\+|-)?(?:90(?:(?:\.0{1,7})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,7})?))$/;

  LON_REGEX =
    /^(\+|-)?(?:180(?:(?:\.0{1,7})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,7})?))$/;

  CURRENCY_REGEX = /^-?\d{1,12}(?:\.\d{0,2})?$/;

  PROTOCOL_REGEX = /^https?:\/\/(.*)$/;

  LON_NEGATIVE = /^-\d*\.?\d+$/;

  WHOLE_NUMBER_REGEX = /^\d*$/;

  checkLat(lat) {
    return this.LAT_REGEX.test(lat);
  }

  checkLon(lon) {
    return this.LON_REGEX.test(lon);
  }

  checkLonNegative(lon) {
    return this.LON_NEGATIVE.test(lon);
  }

  checkPhone(number) {
    return this.PHONE_REGEX.test(number);
  }

  checkEmail(email) {
    return this.EMAIL_REGEX.test(email);
  }

  checkPostalCode(code, country = "CAN") {
    if (country === "USA") {
      return this.US_POSTAL_CODE_REGEX.test(code);
    }
    return this.CAN_POSTAL_CODE_REGEX.test(code);
  }

  checkCurrency(number) {
    return this.CURRENCY_REGEX.test(number);
  }

  checkProtocol(url) {
    return this.PROTOCOL_REGEX.test(url);
  }

  checkWholeNumber(url) {
    return this.WHOLE_NUMBER_REGEX.test(url);
  }
}

export const Validate = new Validator();

export const required = (value) => (value || value === 0 ? undefined : "This is a required field");

export const requiredRadioButton = (value) =>
  value !== null && value !== undefined ? undefined : "This is a required field";

export const requiredNotUndefined = (value) =>
  value !== undefined ? undefined : "This is a required field";

export const requiredList = (value) =>
  value && value.length > 0 ? undefined : "This is a required field";

export const notnone = (value) => (value === "None" ? "Please select an item" : undefined);

export const maxLength = memoize(
  (max) => (value) => value && value.length > max ? `Must be ${max} characters or less` : undefined
);

export const minLength = memoize(
  (min) => (value) => value && value.length < min ? `Must be ${min} characters or more` : undefined
);

export const exactLength = memoize(
  (min) => (value) => value && value.length !== min ? `Must be ${min} characters long` : undefined
);

export const number = (value) =>
  value && Number.isNaN(Number(value)) ? "Input must be a number" : undefined;

export const date = (value) =>
  value && Number.isNaN(Date.parse(value)) ? "Input must be a date" : undefined;

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

export const lonNegative = (value) =>
  value && !Validate.checkLonNegative(value)
    ? "Invalid longitude - must be a negative number"
    : undefined;

export const phoneNumber = (value) =>
  value && !Validate.checkPhone(value) ? "Invalid phone number e.g. xxx-xxx-xxxx" : undefined;

export const postalCode = (value, allValues, formProps) => {
  const { sub_division_code } = allValues;
  const country = formProps.provinceOptions.find(
    (prov) => prov.value === sub_division_code
  )?.subType;
  return value && !Validate.checkPostalCode(value, country)
    ? "Invalid postal code or zip code"
    : undefined;
};

export const protocol = (value) =>
  value && !Validate.checkProtocol(value) ? "Invalid. Url must contain https://" : undefined;

export const email = (value) =>
  value && !Validate.checkEmail(value) ? "Invalid email address" : undefined;

export const currency = (value) =>
  value && !Validate.checkCurrency(value) ? "Invalid dollar amount" : undefined;

export const validSearchSelection =
  ({ key, err }) =>
  (value, allValues, formProps) =>
    !Object.keys(formProps[key]).includes(value) ? err || "Invalid Selection" : undefined;

export const validateStartDate = memoize(
  (previousStartDate) => (value) =>
    value <= previousStartDate
      ? "New manager's start date cannot be on or before the previous manager's start date."
      : undefined
);

export const alertStartDateNotBeforeHistoric = memoize((mineAlerts) => (value) => {
  const isBefore = mineAlerts.some((alert) => new Date(value) < new Date(alert.start_date));
  return isBefore
    ? `Start date cannot come before a historic alert. Please check history for more details.`
    : undefined;
});

export const alertNotInFutureIfCurrentActive = memoize(
  (mineAlert) => (value) =>
    value && mineAlert.start_date && new Date(value) >= new Date()
      ? "Start date cannot be in the future if there is a current active alert.  Please update or remove current alert first"
      : undefined
);

export const dateNotInFuture = (value) =>
  value && new Date(value) >= new Date() ? "Date cannot be in the future" : undefined;

export const dateNotInFutureTZ = (value) => {
  return value && !moment(value).isBefore() ? "Date cannot be in the future" : undefined;
};

export const dateInFuture = (value) =>
  value && new Date(value) < new Date() ? "Date must be in the future" : undefined;

export const dateNotBeforeOther = memoize(
  (other) => (value) =>
    value && other && new Date(value) <= new Date(other)
      ? `Date cannot be on or before ${new Date(other).toDateString()}`
      : undefined
);

export const dateNotBeforeStrictOther = memoize(
  (other) => (value) =>
    value && other && new Date(value) < new Date(other)
      ? `Date cannot be before ${other}`
      : undefined
);

export const timeNotBeforeOther = memoize(
  (comparableDate, baseDate, baseTime) => (comparableTime) =>
    baseTime &&
    baseDate &&
    comparableDate &&
    comparableTime &&
    baseDate === comparableDate &&
    comparableTime < baseTime
      ? `Time cannot be before ${baseTime.format("H:mm")} hrs.`
      : undefined
);

export const dateNotAfterOther = memoize(
  (other) => (value) =>
    value && other && new Date(value) >= new Date(other)
      ? `Date cannot be on or after ${new Date(other).toDateString()}`
      : undefined
);

export const yearNotInFuture = (value) =>
  value && value > new Date().getFullYear() ? "Year cannot be in the future" : undefined;

export const validateIncidentDate = memoize(
  (reportedDate) => (value) =>
    value <= reportedDate
      ? "Incident date and time cannot occur before reporting occurence."
      : undefined
);

// eslint-disable-next-line consistent-return
export const validateSelectOptions = memoize((data, allowEmptyData = false) => (value) => {
  if (value && (data?.length > 0 || allowEmptyData)) {
    return data?.find((opt) => opt.value === value) !== undefined
      ? undefined
      : "Invalid. Select an option provided in the dropdown.";
  }
});

export const decimalPlaces = memoize((places) => (value) => {
  if (value && !Validate.checkWholeNumber(value)) {
    const valueDecimalPlaces = value.split(".")[1];
    return valueDecimalPlaces && valueDecimalPlaces.length > places
      ? `Must be ${places} decimal places or less`
      : undefined;
  }
  return undefined;
});

export const maxDigits = memoize((digits) => (value) => {
  if (value) {
    const valueDigits = value.toString().includes(".")
      ? value.toString().split(".")[0]
      : value.toString();
    return valueDigits && valueDigits.length > digits
      ? `Must be ${digits} digits or less`
      : undefined;
  }
  return undefined;
});

export const wholeNumber = (value) =>
  value && !Validate.checkWholeNumber(value)
    ? "Invalid. The number must be a whole number, decimals not allowed."
    : undefined;

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
    const appointment = { ...appt };
    appointment.start_date = appt.start_date ? toDate(appt.start_date) : MIN_DATE;
    appointment.end_date = appt.end_date ? toDate(appt.end_date) : MAX_DATE;
    return appointment;
  });

  const newDateAppt = { ...newAppt };
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
    const conflictMsg = `Assignment conflicts with existing ${apptType}: ${conflictingAppointments
      .map((appt) => appt.party.name)
      .join()}`;
    errorMessages.start_date = conflictMsg;
    errorMessages.end_date = conflictMsg;
  }

  return errorMessages;
};

export const requiredBoolean = (value) =>
  value || value === false ? undefined : "This is a required field";

export const validateIfApplicationTypeCorrespondsToPermitNumber = (
  applicationType,
  permit,
  isAdminAmendment
) => {
  if (permit && applicationType) {
    return permit?.permit_prefix &&
      Strings.APPLICATION_TYPES_BY_PERMIT_PREFIX[permit.permit_prefix].includes(applicationType)
      ? undefined
      : `The ${
          isAdminAmendment ? "Type of Administrative Amendment" : "Type of Notice of Work"
        } does not match to the selected permit.`;
  }
  return undefined;
};
